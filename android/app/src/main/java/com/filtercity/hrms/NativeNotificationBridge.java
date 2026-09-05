package com.filtercity.hrms;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

public class NativeNotificationBridge {
    static final String PREFS = "fc_native_notifications";
    static final String KEY_ENABLED = "enabled";
    static final String KEY_ORIGIN = "origin";
    static final String KEY_TOKEN = "token";
    static final String KEY_EMPLOYEE_ID = "employee_id";
    static final String KEY_FULL_NAME = "full_name";
    static final String KEY_LAST_TASK_ID = "last_task_id";
    static final String KEY_LAST_ATTENDANCE_DATE = "last_attendance_date";
    static final String KEY_PERMISSION_REQUESTED = "permission_requested";
    static final String CHANNEL_ID = "hrms_reminders";
    static final int NOTIFICATION_PERMISSION_REQUEST = 1003;

    private final MainActivity activity;
    private final SharedPreferences prefs;

    NativeNotificationBridge(MainActivity activity) {
        this.activity = activity;
        this.prefs = activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        createChannel(activity);
    }

    static void createChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null) return;
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "FILTER CITY HRMS Reminders",
                NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Task assignments and attendance reminders");
        manager.createNotificationChannel(channel);
    }

    void syncSession(String origin, String token, String employeeId, String fullName, int baselineTaskId) {
        String cleanOrigin = origin == null ? "" : origin.trim();
        String cleanToken = token == null ? "" : token.trim();
        String cleanEmployee = employeeId == null ? "" : employeeId.trim();
        if (cleanOrigin.isEmpty() || cleanToken.isEmpty() || cleanEmployee.isEmpty()) return;

        String previousEmployee = prefs.getString(KEY_EMPLOYEE_ID, "");
        boolean employeeChanged = !previousEmployee.isEmpty() && !previousEmployee.equals(cleanEmployee);
        SharedPreferences.Editor editor = prefs.edit()
                .putString(KEY_ORIGIN, cleanOrigin)
                .putString(KEY_TOKEN, cleanToken)
                .putString(KEY_EMPLOYEE_ID, cleanEmployee)
                .putString(KEY_FULL_NAME, fullName == null ? "" : fullName.trim());

        if (employeeChanged) {
            editor.putBoolean(KEY_ENABLED, false)
                    .putBoolean(KEY_PERMISSION_REQUESTED, false)
                    .putInt(KEY_LAST_TASK_ID, Math.max(0, baselineTaskId))
                    .remove(KEY_LAST_ATTENDANCE_DATE)
                    .apply();
            NotificationReceiver.cancel(activity);
            return;
        }

        if (!prefs.getBoolean(KEY_ENABLED, false)) {
            editor.putInt(KEY_LAST_TASK_ID, Math.max(0, baselineTaskId));
        }
        editor.apply();
    }

    void ensureEnabled() {
        if (prefs.getString(KEY_EMPLOYEE_ID, "").isEmpty() || prefs.getString(KEY_TOKEN, "").isEmpty()) return;
        activity.runOnUiThread(() -> {
            createChannel(activity);
            if (Build.VERSION.SDK_INT >= 33 && activity.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                if (!prefs.getBoolean(KEY_PERMISSION_REQUESTED, false)) {
                    prefs.edit().putBoolean(KEY_PERMISSION_REQUESTED, true).apply();
                    activity.requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, NOTIFICATION_PERMISSION_REQUEST);
                }
                return;
            }
            completeEnable();
        });
    }

    void onNotificationPermissionResult(boolean granted) {
        if (granted) completeEnable();
        else prefs.edit().putBoolean(KEY_ENABLED, false).apply();
    }

    void completeEnable() {
        prefs.edit().putBoolean(KEY_ENABLED, true).apply();
        NotificationReceiver.schedule(activity);
        NotificationReceiver.pollNow(activity);
    }
}
