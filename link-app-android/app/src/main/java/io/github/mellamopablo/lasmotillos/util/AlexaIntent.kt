package io.github.mellamopablo.lasmotillos.util

import android.content.Intent
import android.net.Uri

data class AlexaIntent(
    private val state: String,
    private val redirectUri: String,
) {
    fun buildRedirectUri(code: String): Uri = Uri.parse(
        "$redirectUri?code=$code&state=$state&source=app"
    )
}

fun Intent.parseAlexaIntent(): AlexaIntent? {
    val data = data ?: return null

    if (data.getQueryParameter("client_id") != "las-motillos") {
        return null
    }

    if (data.getQueryParameter("response_type") != "code") {
        return null
    }

    return AlexaIntent(
        state = data.getQueryParameter("state") ?: return null,
        redirectUri = data.getQueryParameter("redirect_uri") ?: return null,
    )
}
