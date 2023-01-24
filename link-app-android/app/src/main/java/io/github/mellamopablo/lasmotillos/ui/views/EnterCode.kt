package io.github.mellamopablo.lasmotillos.ui.views

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.Button
import androidx.compose.material.Text
import androidx.compose.material.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.google.android.gms.auth.api.phone.SmsRetriever
import io.github.mellamopablo.lasmotillos.util.SmsService

@Composable
fun EnterCode(
    maskedPhoneNumber: String,
    onCodeEntered: (String) -> Unit
) {
    val context = LocalContext.current
    var code by rememberSaveable { mutableStateOf("") }

    LaunchedEffect(Unit) {
        SmsRetriever.getClient(context).startSmsUserConsent(null)

        SmsService.subscribeToSmsMessages { message ->
            val regex = """^([\d]{6}).+motit-motosharing\.firebaseapp\.com.*$""".toRegex()

            regex.matchEntire(message)?.groups?.get(1)?.let {
                code = it.value
            }
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.align(Alignment.Center)
        ) {
            Text(text = "Introduce el código enviado a $maskedPhoneNumber")

            TextField(
                value = code,
                onValueChange = { code = it },
                label = {
                    Text(text = "Code")
                },
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Number,
                )
            )

            Button(
                enabled = code != "",
                onClick = {
                    onCodeEntered(code)
                }
            ) {
                Text(text = "Enviar")
            }
        }
    }
}
