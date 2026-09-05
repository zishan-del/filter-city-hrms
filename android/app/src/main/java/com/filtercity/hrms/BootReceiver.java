package com.filtercity.hrms;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        SharedPreferences prefs = context.getSharedPreferences(NativeNotificationBridge.PREFS, Context.MODE_PRIVATE);
        if (prefs.getBoolean(NativeNotificationBridge.KEY_ENABLED, false)) {
            NativeNotificationBridge.createChannel(context);
            NotificationReceiver.schedule(context);
        }
    }
}
