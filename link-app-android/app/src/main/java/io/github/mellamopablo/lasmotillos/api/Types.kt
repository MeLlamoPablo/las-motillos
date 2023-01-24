package io.github.mellamopablo.lasmotillos.api

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class StartLoginRequest(
    @Json(name = "email") val email: String,
    @Json(name = "password") val password: String,
    @Json(name = "recaptchaToken") val recaptchaToken: String
)

@JsonClass(generateAdapter = true)
data class StartLoginResponse(
    @Json(name = "maskedPhoneNumber") val maskedPhoneNumber: String,
    @Json(name = "sessionInfo") val sessionInfo: String,
)

@JsonClass(generateAdapter = true)
data class CompleteLoginRequest(
    @Json(name = "code") val code: String,
    @Json(name = "sessionInfo") val sessionInfo: String,
)

@JsonClass(generateAdapter = true)
data class CompleteLoginResponse(
    @Json(name = "code") val code: String,
)
