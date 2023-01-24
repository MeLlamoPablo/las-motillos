package io.github.mellamopablo.lasmotillos.util

import android.webkit.WebResourceRequest
import android.webkit.WebView
import com.google.accompanist.web.AccompanistWebViewClient

/**
 * A WebView that reports the ReCaptcha token when Firebase sends it.
 */
class InterceptingClient(private val onCaptchaSolved: (String) -> Unit) : AccompanistWebViewClient() {
    private val recaptchaTokenRegex = """Intent;scheme=recaptcha;.+S\.link=https://motit-motosharing\.firebaseapp\.com.+recaptchaToken=(.+)&eventId.+""".toRegex()

    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        if (request?.url?.scheme == "intent" && request.url.host == "firebase.auth") {
            val recaptchaToken = request.url.fragment
                ?.let { recaptchaTokenRegex.matchEntire(it) }
                ?.let { it.groups[1]?.value }

            if (recaptchaToken != null) {
                onCaptchaSolved(recaptchaToken)
                return true
            }
        }

        return super.shouldOverrideUrlLoading(view, request)
    }
}
