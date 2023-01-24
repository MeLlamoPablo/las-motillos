package io.github.mellamopablo.lasmotillos.api

import com.squareup.moshi.Moshi
import io.github.mellamopablo.lasmotillos.ui.views.Credentials
import okhttp3.OkHttpClient
import retrofit2.HttpException
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory

private object ApiModule {
    private val okHttp = OkHttpClient.Builder().build()

    private val moshi = Moshi.Builder().build()

    private val retrofit = Retrofit.Builder()
        .baseUrl("https://las-motillos-acciona-login.vercel.app/")
        .addConverterFactory(MoshiConverterFactory.create(moshi))
        .client(okHttp)
        .build()

    val apiService: ApiService = retrofit.create(ApiService::class.java)
}

object Api {
    sealed interface StartLoginResult {
        data class Success(val maskedPhoneNumber: String, val sessionInfo: String) :
            StartLoginResult
        sealed interface Error : StartLoginResult {
            object InvalidCredentials : Error
            object RateLimited : Error
            object Unexpected : Error
        }
    }

    suspend fun startLogin(credentials: Credentials, recaptchaToken: String): StartLoginResult {
        return try {
            val response = ApiModule.apiService.startLogin(
                StartLoginRequest(
                    email = credentials.email,
                    password = credentials.password,
                    recaptchaToken = recaptchaToken,
                )
            )

            StartLoginResult.Success(
                maskedPhoneNumber = response.maskedPhoneNumber,
                sessionInfo = response.sessionInfo,
            )
        } catch (e: HttpException) {
            when (e.code()) {
                401 -> {
                    StartLoginResult.Error.InvalidCredentials
                }
                429 -> {
                    StartLoginResult.Error.RateLimited
                }
                else -> {
                    StartLoginResult.Error.Unexpected
                }
            }
        }
    }

    sealed interface CompleteLoginResult {
        data class Success(val code: String) : CompleteLoginResult
        object CodeError : CompleteLoginResult
        object UnexpectedError : CompleteLoginResult
    }

    suspend fun completeLogin(code: String, sessionInfo: String): CompleteLoginResult {
        return try {
            val response = ApiModule.apiService.completeLogin(
                CompleteLoginRequest(
                    code = code,
                    sessionInfo = sessionInfo,
                )
            )

            CompleteLoginResult.Success(response.code)
        } catch (e: HttpException) {
            if (e.code() == 401) {
                CompleteLoginResult.CodeError
            } else {
                CompleteLoginResult.UnexpectedError
            }
        }
    }
}
