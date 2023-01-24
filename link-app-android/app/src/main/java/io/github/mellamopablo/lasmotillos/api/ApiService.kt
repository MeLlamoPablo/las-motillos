package io.github.mellamopablo.lasmotillos.api

import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {
    @POST("/api/start-login")
    suspend fun startLogin(@Body body: StartLoginRequest): StartLoginResponse

    @POST("/api/complete-login")
    suspend fun completeLogin(@Body body: CompleteLoginRequest): CompleteLoginResponse
}
