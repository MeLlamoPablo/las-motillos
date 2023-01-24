package io.github.mellamopablo.lasmotillos.ui.views

import android.annotation.SuppressLint
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import com.google.accompanist.web.WebView
import com.google.accompanist.web.rememberWebViewState
import io.github.mellamopablo.lasmotillos.util.InterceptingClient
import java.util.UUID

private val url = "https://motit-motosharing.firebaseapp.com/__/auth/handler?apiKey=AIzaSyBRgvko4YOMuvSEpCKtei1eGazNd4dwLQ8&authType=verifyApp&apn=com.acciona.mobility.app&hl=es-ES%2C%20en-US&eventId=${UUID.randomUUID()}6ab&v=XX21000001&eid=p&appName=%5BDEFAULT%5D&sha1Cert=d3060049db9e44ec8babe215545b2563775751f1&publicKey=CIzYiMIBEtsBCs4BCj10eXBlLmdvb2dsZWFwaXMuY29tL2dvb2dsZS5jcnlwdG8udGluay5FY2ll%0Ac0FlYWRIa2RmUHVibGljS2V5EooBEkQKBAgCEAMSOhI4CjB0eXBlLmdvb2dsZWFwaXMuY29tL2dv%0Ab2dsZS5jcnlwdG8udGluay5BZXNHY21LZXkSAhAQGAEYARogKYMLeR6uU5iGp5i3mNZXutR_wZNp%0AFTiou4VGk5kgzgoiIF8i8ZPbA_aH4RSpjSv5b77jr6-GuQvQf4_H_ZyZtINiGAMQARiM2IjCASAB%0A"

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun Captcha(onCaptchaSolved: (String) -> Unit) {
    WebView(
        client = remember { InterceptingClient(onCaptchaSolved) },
        state = rememberWebViewState(url),
        onCreated = {
            it.settings.javaScriptEnabled = true
        },
        modifier = Modifier.fillMaxSize(),
    )
}
