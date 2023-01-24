package io.github.mellamopablo.lasmotillos.util

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.google.android.gms.auth.api.phone.SmsRetriever
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.common.api.Status
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.launch

object SmsService {
    private val coroutineScope = CoroutineScope(Dispatchers.IO)
    private val consentIntentsFlow = MutableSharedFlow<Intent>()
    private val smsMessagesFlow = MutableSharedFlow<String>()

    fun onConsentIntentReceived(intent: Intent) {
        coroutineScope.launch {
            consentIntentsFlow.emit(intent)
        }
    }

    fun onSmsMessageReceived(message: String) {
        coroutineScope.launch {
            smsMessagesFlow.emit(message)
        }
    }

    suspend fun subscribeToConsentIntents(onConsentIntent: (Intent) -> Unit) {
        consentIntentsFlow.collect(onConsentIntent)
    }

    suspend fun subscribeToSmsMessages(onSmsMessage: (String) -> Unit) {
        smsMessagesFlow.collect(onSmsMessage)
    }
}

object SmsBroadcastReceiver : BroadcastReceiver() {
    @Suppress("DEPRECATION") // There isn't an alternative for deprecated methods
    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == SmsRetriever.SMS_RETRIEVED_ACTION) {
            val extras = intent.extras
            val smsRetrieverStatus = extras?.get(SmsRetriever.EXTRA_STATUS) as? Status

            if (smsRetrieverStatus?.statusCode == CommonStatusCodes.SUCCESS) {
                val consentIntent = extras.getParcelable(SmsRetriever.EXTRA_CONSENT_INTENT) as? Intent
                consentIntent?.let(SmsService::onConsentIntentReceived)
            }
        }

    }
}
