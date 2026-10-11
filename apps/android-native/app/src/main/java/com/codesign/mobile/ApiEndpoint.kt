package com.codesign.mobile

/** URL normalization kept separate so endpoint rules are easy to review. */
internal fun chatCompletionsEndpoint(baseUrl: String): String {
    val normalized = baseUrl.trim().trimEnd('/')
    require(normalized.startsWith("https://")) { "Use a secure HTTPS API endpoint." }
    require(normalized.length > "https://".length) { "Enter a valid API base URL." }
    return if (normalized.endsWith("/v1")) "$normalized/chat/completions" else "$normalized/v1/chat/completions"
}
