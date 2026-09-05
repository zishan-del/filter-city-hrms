package com.filtercity.hrms;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.PowerManager;
import android.os.SystemClock;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

public class NotificationReceiver extends BroadcastReceiver {
    private static final int REQUEST_POLL = 9201;
    private static final long POLL_INTERVAL_MS = 15L * 60L * 1000L;

    @Override
    public void onReceive(Context context, Intent intent) {
        PendingResult pending = goAsync();
        PowerManager.WakeLock wakeLock = null;
        try {
            PowerManager power = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            if (power != null) {
                wakeLock = power.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "FILTERCITYHRMS:notificationPoll");
                wakeLock.acquire(30_000L);
            }
        } catch (Exception ignored) {}
        final PowerManager.WakeLock finalWakeLock = wakeLock;
        new Thread(() -> {
            try {
                poll(context.getApplicationContext());
            } catch (Exception ignored) {
            } finally {
                try {
                    if (finalWakeLock != null && finalWakeLock.isHeld()) finalWakeLock.release();
                } catch (Exception ignored) {}
                pending.finish();
            }
        }, "fc-notification-poll").start();
    }

    public static void schedule(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(NativeNotificationBridge.PREFS, Context.MODE_PRIVATE);
        if (!prefs.getBoolean(NativeNotificationBridge.KEY_ENABLED, false)) return;
        AlarmManager alarm = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarm == null) return;
        PendingIntent pi = pollPendingIntent(context);
        long first = SystemClock.elapsedRealtime() + 30_000L;
        alarm.setInexactRepeating(AlarmManager.ELAPSED_REALTIME_WAKEUP, first, POLL_INTERVAL_MS, pi);
    }

    public static void cancel(Context context) {
        AlarmManager alarm = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarm != null) alarm.cancel(pollPendingIntent(context));
    }

    public static void pollNow(Context context) {
        Intent intent = new Intent(context, NotificationReceiver.class);
        intent.setAction("com.filtercity.hrms.POLL_NOTIFICATIONS");
        context.sendBroadcast(intent);
    }

    private static PendingIntent pollPendingIntent(Context context) {
        Intent intent = new Intent(context, NotificationReceiver.class);
        intent.setAction("com.filtercity.hrms.POLL_NOTIFICATIONS");
        return PendingIntent.getBroadcast(
                context,
                REQUEST_POLL,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private static void poll(Context context) throws Exception {
        SharedPreferences prefs = context.getSharedPreferences(NativeNotificationBridge.PREFS, Context.MODE_PRIVATE);
        if (!prefs.getBoolean(NativeNotificationBridge.KEY_ENABLED, false)) return;
        String token = prefs.getString(NativeNotificationBridge.KEY_TOKEN, "");
        String employeeId = prefs.getString(NativeNotificationBridge.KEY_EMPLOYEE_ID, "");
        String origin = prefs.getString(NativeNotificationBridge.KEY_ORIGIN, "");
        if (token.isEmpty() || employeeId.isEmpty() || origin.isEmpty()) return;

        JSONObject data = fetchData(origin, token);
        if (data == null) return;
        handleTasks(context, prefs, data.optJSONArray("tasks"), employeeId);
        handleAttendance(context, prefs, data, employeeId);
    }

    private static JSONObject fetchData(String origin, String token) {
        HttpURLConnection connection = null;
        try {
            String base = origin.endsWith("/") ? origin.substring(0, origin.length() - 1) : origin;
            connection = (HttpURLConnection) new URL(base + "/api/data").openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(10_000);
            connection.setReadTimeout(10_000);
            connection.setRequestProperty("Authorization", "Bearer " + token);
            connection.setRequestProperty("Accept", "application/json");
            int code = connection.getResponseCode();
            if (code < 200 || code >= 300) return null;
            InputStream stream = connection.getInputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            StringBuilder body = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) body.append(line);
            reader.close();
            return new JSONObject(body.toString());
        } catch (Exception ignored) {
            return null;
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    private static void handleTasks(Context context, SharedPreferences prefs, JSONArray tasks, String employeeId) {
        if (tasks == null) return;
        int lastTaskId = prefs.getInt(NativeNotificationBridge.KEY_LAST_TASK_ID, 0);
        int newestSeen = lastTaskId;
        List<JSONObject> fresh = new ArrayList<>();

        for (int i = 0; i < tasks.length(); i++) {
            JSONObject task = tasks.optJSONObject(i);
            if (task == null || !employeeId.equals(task.optString("employee_id", ""))) continue;
            int id = task.optInt("id", 0);
            if (id > newestSeen) newestSeen = id;
            if (id <= lastTaskId) continue;
            String status = task.optString("status", "Pending");
            if ("Completed".equalsIgnoreCase(status) || "Done".equalsIgnoreCase(status) || "Cancelled".equalsIgnoreCase(status)) continue;
            fresh.add(task);
        }

        Collections.sort(fresh, Comparator.comparingInt(o -> o.optInt("id", 0)));
        int shown = 0;
        for (JSONObject task : fresh) {
            if (shown >= 5) break;
            int id = task.optInt("id", 0);
            String title = task.optString("title", "New task assigned");
            String deadline = task.optString("deadline_time", "");
            String body = deadline.isEmpty() || "null".equalsIgnoreCase(deadline)
                    ? title
                    : title + " — deadline " + deadline;
            showNotification(context, 300000 + (id % 100000), "New Task Assigned", body);
            shown++;
        }

        if (fresh.size() > 5) {
            showNotification(context, 399999, "New Tasks Assigned", (fresh.size() - 5) + " more task(s) were assigned to you.");
        }
        if (newestSeen > lastTaskId) prefs.edit().putInt(NativeNotificationBridge.KEY_LAST_TASK_ID, newestSeen).apply();
    }

    private static void handleAttendance(Context context, SharedPreferences prefs, JSONObject data, String employeeId) {
        TimeZone riyadh = TimeZone.getTimeZone("Asia/Riyadh");
        java.util.Calendar cal = java.util.Calendar.getInstance(riyadh);
        int hour = cal.get(java.util.Calendar.HOUR_OF_DAY);
        int minute = cal.get(java.util.Calendar.MINUTE);
        if (hour < 8 || (hour == 8 && minute < 15)) return;

        SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
        fmt.setTimeZone(riyadh);
        String today = fmt.format(new Date());
        if (today.equals(prefs.getString(NativeNotificationBridge.KEY_LAST_ATTENDANCE_DATE, ""))) return;

        JSONArray holidays = data.optJSONArray("holidays");
        if (containsHoliday(holidays, today)) return;
        JSONArray leaves = data.optJSONArray("leaves");
        if (onApprovedLeave(leaves, employeeId, today)) return;
        JSONArray attendance = data.optJSONArray("attendance");
        if (alreadyCheckedIn(attendance, employeeId, today)) return;

        String fullName = prefs.getString(NativeNotificationBridge.KEY_FULL_NAME, "");
        if (fullName.isEmpty()) fullName = employeeId;
        showNotification(
                context,
                410001,
                "Attendance Reminder",
                fullName + ", you have not checked in today. Please open FILTER CITY HRMS and check in."
        );
        prefs.edit().putString(NativeNotificationBridge.KEY_LAST_ATTENDANCE_DATE, today).apply();
    }

    private static boolean containsHoliday(JSONArray rows, String today) {
        if (rows == null) return false;
        for (int i = 0; i < rows.length(); i++) {
            JSONObject row = rows.optJSONObject(i);
            if (row != null && row.optString("holiday_date", "").startsWith(today)) return true;
        }
        return false;
    }

    private static boolean onApprovedLeave(JSONArray rows, String employeeId, String today) {
        if (rows == null) return false;
        for (int i = 0; i < rows.length(); i++) {
            JSONObject row = rows.optJSONObject(i);
            if (row == null) continue;
            if (!employeeId.equals(row.optString("employee_id", ""))) continue;
            if (!"Approved".equalsIgnoreCase(row.optString("status", ""))) continue;
            String start = row.optString("start_date", "");
            String end = row.optString("end_date", "");
            if (start.length() >= 10) start = start.substring(0, 10);
            if (end.length() >= 10) end = end.substring(0, 10);
            if (!start.isEmpty() && !end.isEmpty() && start.compareTo(today) <= 0 && end.compareTo(today) >= 0) return true;
        }
        return false;
    }

    private static boolean alreadyCheckedIn(JSONArray rows, String employeeId, String today) {
        if (rows == null) return false;
        for (int i = 0; i < rows.length(); i++) {
            JSONObject row = rows.optJSONObject(i);
            if (row == null) continue;
            if (!employeeId.equals(row.optString("employee_id", ""))) continue;
            if (!row.optString("work_date", "").startsWith(today)) continue;
            if (!row.isNull("check_in") && !row.optString("check_in", "").isEmpty()) return true;
        }
        return false;
    }

    private static void showNotification(Context context, int id, String title, String body) {
        NativeNotificationBridge.createChannel(context);
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null) return;

        Intent open = new Intent(context, MainActivity.class);
        open.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
                context,
                id,
                open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Notification.Builder builder = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? new Notification.Builder(context, NativeNotificationBridge.CHANNEL_ID)
                : new Notification.Builder(context);
        builder.setSmallIcon(com.filtercity.hrms.R.drawable.ic_filter_city)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new Notification.BigTextStyle().bigText(body))
                .setAutoCancel(true)
                .setContentIntent(contentIntent)
                .setPriority(Notification.PRIORITY_HIGH);
        manager.notify(id, builder.build());
    }
}
