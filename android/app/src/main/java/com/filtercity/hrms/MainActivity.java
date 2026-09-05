package com.filtercity.hrms;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.GeolocationPermissions;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;
import org.json.JSONTokener;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER = 1001;
    private static final int LOCATION_PERMISSION = 1002;
    private static final String APP_URL = "https://filter-city-hrms-git-fix-native-notifications-c42395-filtercity.vercel.app/";
    private ValueCallback<Uri[]> uploadCallback;
    private GeolocationPermissions.Callback pendingGeoCallback;
    private String pendingGeoOrigin;
    private WebView web;
    private NativeNotificationBridge notificationBridge;
    private Handler notificationHandler;

    private final Runnable sessionSync = new Runnable() {
        @Override public void run() {
            syncEmployeeSessionFromWeb();
            if (notificationHandler != null) notificationHandler.postDelayed(this, 10_000L);
        }
    };

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        notificationHandler = new Handler(Looper.getMainLooper());
        web = new WebView(this);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setUserAgentString(settings.getUserAgentString() + " FILTERCITYHRMS-ANDROID");

        notificationBridge = new NativeNotificationBridge(this);
        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (notificationHandler != null) {
                    notificationHandler.removeCallbacks(sessionSync);
                    notificationHandler.postDelayed(sessionSync, 800L);
                }
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (uploadCallback != null) uploadCallback.onReceiveValue(null);
                uploadCallback = callback;
                try {
                    Intent intent = params.createIntent();
                    startActivityForResult(intent, FILE_CHOOSER);
                    return true;
                } catch (Exception e) {
                    uploadCallback = null;
                    return false;
                }
            }

            @Override public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                    checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                    callback.invoke(origin, true, false);
                    return;
                }
                pendingGeoOrigin = origin;
                pendingGeoCallback = callback;
                requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, LOCATION_PERMISSION);
            }
        });
        web.loadUrl(APP_URL);
        setContentView(web);
    }

    private void syncEmployeeSessionFromWeb() {
        if (web == null || notificationBridge == null) return;
        String script = "(function(){try{" +
                "var token=localStorage.getItem('fc_hrms_token')||'';" +
                "var u=null;try{u=JSON.parse(sessionStorage.getItem('fc_user')||'null');}catch(_){u=null;}" +
                "if(!token||!u||String(u.role||'').toUpperCase()!=='EMPLOYEE')return '';" +
                "var employeeId=String(u.employeeId||u.employee_id||'').trim();if(!employeeId)return '';" +
                "var st=(typeof state!=='undefined'&&state)?state:window.state;if(!st||!Array.isArray(st.tasks)||!Array.isArray(st.employees))return '';" +
                "var emp=st.employees.find(function(e){return String(e.employee_id||'')===employeeId;});" +
                "var fullName=String((emp&&emp.full_name)||u.username||employeeId);" +
                "var maxTask=0;st.tasks.forEach(function(t){if(String(t.employee_id||'')===employeeId)maxTask=Math.max(maxTask,Number(t.id||0));});" +
                "return JSON.stringify({origin:location.origin,token:token,employeeId:employeeId,fullName:fullName,maxTask:maxTask});" +
                "}catch(e){return '';}})();";
        web.evaluateJavascript(script, value -> {
            try {
                Object decoded = new JSONTokener(value).nextValue();
                if (!(decoded instanceof String)) return;
                String json = (String) decoded;
                if (json.isEmpty()) return;
                JSONObject session = new JSONObject(json);
                notificationBridge.syncSession(
                        session.optString("origin", ""),
                        session.optString("token", ""),
                        session.optString("employeeId", ""),
                        session.optString("fullName", ""),
                        session.optInt("maxTask", 0)
                );
                notificationBridge.ensureEnabled();
            } catch (Exception ignored) {}
        });
    }

    @Override protected void onResume() {
        super.onResume();
        SharedPreferences prefs = getSharedPreferences(NativeNotificationBridge.PREFS, Context.MODE_PRIVATE);
        if (prefs.getBoolean(NativeNotificationBridge.KEY_ENABLED, false)) NotificationReceiver.schedule(this);
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == NativeNotificationBridge.NOTIFICATION_PERMISSION_REQUEST) {
            boolean granted = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
            if (notificationBridge != null) notificationBridge.onNotificationPermissionResult(granted);
            return;
        }
        if (requestCode != LOCATION_PERMISSION || pendingGeoCallback == null) return;
        boolean granted = false;
        for (int result : grantResults) {
            if (result == PackageManager.PERMISSION_GRANTED) {
                granted = true;
                break;
            }
        }
        pendingGeoCallback.invoke(pendingGeoOrigin, granted, false);
        pendingGeoCallback = null;
        pendingGeoOrigin = null;
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != FILE_CHOOSER || uploadCallback == null) return;
        Uri[] results = null;
        if (resultCode == RESULT_OK && data != null) {
            if (data.getClipData() != null) {
                int n = data.getClipData().getItemCount();
                results = new Uri[n];
                for (int i = 0; i < n; i++) results[i] = data.getClipData().getItemAt(i).getUri();
            } else if (data.getData() != null) {
                results = new Uri[]{data.getData()};
            }
        }
        uploadCallback.onReceiveValue(results);
        uploadCallback = null;
    }

    @Override protected void onDestroy() {
        if (notificationHandler != null) notificationHandler.removeCallbacks(sessionSync);
        super.onDestroy();
    }

    @Override public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
}
