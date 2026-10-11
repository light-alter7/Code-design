package com.codesign.mobile

import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class ApiEndpointTest {
    @Test
    fun appendsVersionAndPathToHost() {
        assertEquals(
            "https://api.example.com/v1/chat/completions",
            chatCompletionsEndpoint("https://api.example.com/")
        )
    }

    @Test
    fun avoidsDuplicatingVersionSegment() {
        assertEquals(
            "https://api.example.com/v1/chat/completions",
            chatCompletionsEndpoint("https://api.example.com/v1/")
        )
    }

    @Test
    fun rejectsInsecureHttpEndpoint() {
        assertThrows(IllegalArgumentException::class.java) {
            chatCompletionsEndpoint("http://api.example.com")
        }
    }

    @Test
    fun rejectsEmptyHttpsHost() {
        assertThrows(IllegalArgumentException::class.java) {
            chatCompletionsEndpoint("https://")
        }
    }
}
