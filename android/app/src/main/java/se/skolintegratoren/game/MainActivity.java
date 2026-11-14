package se.skolintegratoren.game;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    /** Game background (--bg in style.css, theme-color in index.html). */
    private static final int GAME_BG = Color.parseColor("#0d1424");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Android 15+ is edge-to-edge and ignores bar colors; there the WebView's dark
        // background shows behind the bars (SystemBars in capacitor.config.ts). Older
        // versions get solid bars in the game color with light icons.
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.VANILLA_ICE_CREAM) {
            Window window = getWindow();
            window.setStatusBarColor(GAME_BG);
            window.setNavigationBarColor(GAME_BG);
        }

        // No pinch or double-tap zoom.
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebSettings settings = getBridge().getWebView().getSettings();
            settings.setSupportZoom(false);
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);
        }
    }
}
