package com.shriya.papasrecordroom;

import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.animation.LinearInterpolator;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * A welcome screen with a spinning record that opens Papa's Record Room.
 * The room is a claude.ai page, so it opens in a Chrome Custom Tab: Chrome keeps him
 * signed in to Claude, and Google sign-in works there (it doesn't inside an in-app web view).
 */
public class MainActivity extends Activity {
  static final String ROOM = "https://claude.ai/artifact/6srz6H2Dz1aEBrgoVh1H7P";
  static final int WALNUT = 0xFF1D1512, BRASS = 0xFFD6A85A, PAPER = 0xFFF1E6D2, MUTED = 0xFFB6A48C;
  private boolean opened;

  @Override protected void onCreate(Bundle state) {
    super.onCreate(state);
    opened = state != null && state.getBoolean("opened");
    float dp = getResources().getDisplayMetrics().density;

    LinearLayout root = new LinearLayout(this);
    root.setOrientation(LinearLayout.VERTICAL);
    root.setGravity(Gravity.CENTER);
    root.setPadding((int) (28 * dp), (int) (40 * dp), (int) (28 * dp), (int) (40 * dp));
    GradientDrawable bg = new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM, new int[] { 0xFF3A2418, WALNUT, WALNUT });
    root.setBackground(bg);

    TextView eyebrow = text("HAPPY 54TH BIRTHDAY", 11, BRASS, Typeface.MONOSPACE);
    eyebrow.setLetterSpacing(.18f);

    ImageView record = new ImageView(this);
    record.setImageResource(R.drawable.record);
    LinearLayout.LayoutParams rp = new LinearLayout.LayoutParams((int) (230 * dp), (int) (230 * dp));
    rp.setMargins(0, (int) (28 * dp), 0, (int) (28 * dp));
    record.setLayoutParams(rp);
    ObjectAnimator spin = ObjectAnimator.ofFloat(record, "rotation", 0f, 360f);
    spin.setDuration(1800); spin.setRepeatCount(ValueAnimator.INFINITE); spin.setInterpolator(new LinearInterpolator());
    spin.start();

    TextView title = text("Papa's\nRecord Room", 40, PAPER, Typeface.create(Typeface.SERIF, Typeface.NORMAL));
    title.setLineSpacing(0, .95f);
    TextView sub = text("Happy 54th, Papa. With love from Mumma, Bhaiya, Shriya, Leo & Shiro.", 15, MUTED, Typeface.DEFAULT);
    sub.setPadding(0, (int) (12 * dp), 0, (int) (28 * dp));

    Button open = new Button(this);
    open.setText("Drop the needle");
    open.setAllCaps(false);
    open.setTextSize(17);
    open.setTypeface(Typeface.DEFAULT_BOLD);
    open.setTextColor(0xFF22170F);
    GradientDrawable pill = new GradientDrawable();
    pill.setColor(BRASS); pill.setCornerRadius(999 * dp);
    open.setBackground(pill);
    open.setPadding((int) (28 * dp), (int) (14 * dp), (int) (28 * dp), (int) (14 * dp));
    open.setOnClickListener(new android.view.View.OnClickListener() { @Override public void onClick(android.view.View v) { openRoom(); } });

    TextView hint = text("Opens in Chrome. The first time, sign in to Claude with the account the room was shared with.", 12, MUTED, Typeface.DEFAULT);
    hint.setPadding(0, (int) (18 * dp), 0, 0);

    root.addView(eyebrow); root.addView(record); root.addView(title); root.addView(sub); root.addView(open); root.addView(hint);
    setContentView(root);

    // On a fresh launch, let the record spin for a moment, then open the room.
    if (!opened) new Handler(Looper.getMainLooper()).postDelayed(new Runnable() { @Override public void run() { if (!opened && !isFinishing()) openRoom(); } }, 1600);
  }

  private TextView text(String s, int sp, int color, Typeface face) {
    TextView t = new TextView(this);
    t.setText(s); t.setTextSize(sp); t.setTextColor(color); t.setTypeface(face); t.setGravity(Gravity.CENTER);
    return t;
  }

  private void openRoom() {
    opened = true;
    Uri uri = Uri.parse(ROOM);
    // A Custom Tab request without the androidx library: the session extra (even null) is what asks for one.
    Intent tab = new Intent(Intent.ACTION_VIEW, uri);
    Bundle extras = new Bundle();
    extras.putBinder("android.support.customtabs.extra.SESSION", null);
    tab.putExtras(extras);
    tab.putExtra("android.support.customtabs.extra.TOOLBAR_COLOR", WALNUT);
    tab.putExtra("android.support.customtabs.extra.TITLE_VISIBILITY", 1);
    try { tab.setPackage("com.android.chrome"); startActivity(tab); return; } catch (ActivityNotFoundException e) { }
    try { tab.setPackage(null); startActivity(tab); } catch (ActivityNotFoundException e) {
      startActivity(Intent.createChooser(new Intent(Intent.ACTION_VIEW, uri), "Open the Record Room"));
    }
  }

  @Override protected void onSaveInstanceState(Bundle out) {
    super.onSaveInstanceState(out);
    out.putBoolean("opened", opened);
  }
}
