package io.github.mellamopablo.lasmotillos

import android.app.Activity
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.material.Text
import androidx.compose.ui.Modifier
import androidx.lifecycle.lifecycleScope
import com.google.android.gms.auth.api.phone.SmsRetriever
import io.github.mellamopablo.lasmotillos.api.Api
import io.github.mellamopablo.lasmotillos.ui.theme.AppTheme
import io.github.mellamopablo.lasmotillos.ui.views.Credentials
import io.github.mellamopablo.lasmotillos.ui.views.LinkFlow
import io.github.mellamopablo.lasmotillos.util.SmsBroadcastReceiver
import io.github.mellamopablo.lasmotillos.util.SmsService
import io.github.mellamopablo.lasmotillos.util.parseAlexaIntent
import kotlinx.coroutines.launch

sealed interface Step {
    object Login : Step
    class Captcha(val credentials: Credentials) : Step
    class EnterCode(val loginResult: Api.StartLoginResult.Success) : Step
}

class MainActivity : ComponentActivity() {
    private val smsConsent = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {
        if (it.resultCode == Activity.RESULT_OK && it.data != null) {
            it.data
                ?.getStringExtra(SmsRetriever.EXTRA_SMS_MESSAGE)
                ?.let(SmsService::onSmsMessageReceived)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val alexaIntent = intent?.parseAlexaIntent()

        setContent {
            AppTheme {
                Surface(
                    color = MaterialTheme.colors.background,
                    modifier = Modifier.fillMaxSize()
                ) {
                    if (alexaIntent != null) {
                        LinkFlow(
                            onAuthCode = {
                                startActivity(
                                    Intent().apply {
                                        action = Intent.ACTION_VIEW
                                        data = alexaIntent.buildRedirectUri(it)
                                    }
                                )
                            }
                        )
                    } else {
                        Text(text = "Ve a la app de Alexa para vincular tu cuenta de Acciona")
                    }
                }
            }
        }

        listenForSmsConsents()
    }

    private fun listenForSmsConsents() {
        registerReceiver(
            SmsBroadcastReceiver,
            IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION),
        )

        lifecycleScope.launch {
            SmsService.subscribeToConsentIntents {
                smsConsent.launch(it)
            }
        }
    }
}
