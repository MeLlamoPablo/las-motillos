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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp

data class Credentials(val email: String, val password: String)

@Composable
fun Login(onLogin: (Credentials) -> Unit) {
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.align(Alignment.Center)
        ) {
            TextField(
                value = email,
                onValueChange = { email = it },
                label = {
                    Text(text = "Email")
                },
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Email,
                )
            )

            TextField(
                value = password,
                onValueChange = { password = it },
                label = {
                    Text(text = "Contraseña")
                },
                visualTransformation = remember { PasswordVisualTransformation() },
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                )
            )

            Button(
                enabled = email != "" && password != "",
                onClick = {
                    onLogin(Credentials(email, password))
                }
            ) {
                Text(text = "Iniciar sesión")
            }
        }
    }
}
