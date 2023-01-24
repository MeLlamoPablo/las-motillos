package io.github.mellamopablo.lasmotillos.ui.views

import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.platform.LocalContext
import io.github.mellamopablo.lasmotillos.R
import io.github.mellamopablo.lasmotillos.Step
import io.github.mellamopablo.lasmotillos.api.Api
import io.github.mellamopablo.lasmotillos.util.toast
import kotlinx.coroutines.launch

@Composable
fun LinkFlow(onAuthCode: (String) -> Unit) {
    val context = LocalContext.current
    val (step, setStep) = remember { mutableStateOf<Step>(Step.Login) }
    val coroutineScope = rememberCoroutineScope()

    when (step) {
        is Step.Login -> {
            Login(
                onLogin = {
                    setStep(Step.Captcha(it))
                }
            )
        }
        is Step.Captcha -> {
            Captcha(onCaptchaSolved = {
                coroutineScope.launch {
                    val result = Api.startLogin(
                        credentials = step.credentials,
                        recaptchaToken = it,
                    )

                    when (result) {
                        is Api.StartLoginResult.Success -> {
                            setStep(Step.EnterCode(result))
                        }
                        is Api.StartLoginResult.Error -> {
                            setStep(Step.Login)
                            context.toast(
                                when (result) {
                                    is Api.StartLoginResult.Error.InvalidCredentials -> {
                                        R.string.error_invalid_credentials
                                    }
                                    is Api.StartLoginResult.Error.RateLimited -> {
                                        R.string.error_rate_limited
                                    }
                                    is Api.StartLoginResult.Error.Unexpected -> {
                                        R.string.error_unexpected
                                    }
                                }
                            )
                        }
                    }
                }
            })
        }
        is Step.EnterCode -> {
            EnterCode(
                maskedPhoneNumber = step.loginResult.maskedPhoneNumber,
                onCodeEntered = {
                    coroutineScope.launch {
                        val result = Api.completeLogin(
                            code = it,
                            sessionInfo = step.loginResult.sessionInfo,
                        )

                        if (
                            result is Api.CompleteLoginResult.Success
                        ) {
                            onAuthCode(result.code)
                        }
                    }
                }
            )
        }
    }
}
