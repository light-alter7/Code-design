package com.codesign.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

private val Ink = Color(0xFF000000)
private val Panel = Color(0xFF111111)
private val Panel2 = Color(0xFF242424)
private val Accent = Color(0xFFFF7A1A)
private val TextMain = Color(0xFFFFFFFF)
private val TextMuted = Color(0xFFAAAAAA)
private val UserBubble = Color(0xFF252525)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = android.graphics.Color.rgb(0, 0, 0)
        window.navigationBarColor = android.graphics.Color.rgb(0, 0, 0)
        setContent { LoomdesignApp() }
    }
}

private data class ChatMessage(val role: String, val content: String)
private enum class Screen { CHAT, PROJECTS, SETTINGS, NOT_FOUND, PAYMENT_REQUIRED }

@Composable
private fun LoomdesignApp() {
    var screen by remember { mutableStateOf(Screen.CHAT) }
    var baseUrl by remember { mutableStateOf("https://api.openai.com") }
    var model by remember { mutableStateOf("gpt-4o-mini") }
    var apiKey by remember { mutableStateOf("") } // Intentionally session-only; never persisted.
    var draft by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var status by remember { mutableStateOf<String?>(null) }
    val messages = remember { mutableStateListOf<ChatMessage>() }
    val listState = rememberLazyListState()

    BackHandler(enabled = screen != Screen.CHAT) { screen = Screen.CHAT }

    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Accent,
            onPrimary = Ink,
            background = Ink,
            surface = Panel,
            onSurface = TextMain,
            onBackground = TextMain,
            secondary = TextMuted
        )
    ) {
        Surface(modifier = Modifier.fillMaxSize(), color = Ink) {
            Column(modifier = Modifier.fillMaxSize()) {
                TopBar(
                    screen = screen,
                    onBack = { screen = Screen.CHAT },
                    onNewChat = {
                        messages.clear()
                        status = null
                        screen = Screen.CHAT
                    }
                )
                Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
                when (screen) {
                    Screen.CHAT -> {
                        Column(modifier = Modifier.fillMaxSize()) {
                        LazyColumn(
                            state = listState,
                            modifier = Modifier.weight(1f).fillMaxWidth(),
                            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 18.dp),
                            verticalArrangement = Arrangement.spacedBy(18.dp)
                        ) {
                            if (messages.isEmpty()) {
                                item { WelcomeIntro() }
                                item {
                                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Text("TRY ASKING", color = TextMuted, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, letterSpacing = 1.4.sp)
                                        Suggestion("Design a clean mobile app", Icons.Default.AutoAwesome) { draft = "Help me design a clean mobile app" }
                                        Suggestion("Explain this code simply", Icons.Default.Code) { draft = "Help me understand code step by step" }
                                        Suggestion("Turn my idea into a plan", Icons.Default.Tune) { draft = "Help me turn my idea into a practical development plan" }
                                    }
                                }
                            }
                            items(messages) { message -> MessageBubble(message) }
                            if (busy) item { TypingIndicator() }
                        }
                        Composer(
                            value = draft,
                            onValueChange = { draft = it },
                            busy = busy,
                            onSettings = { screen = Screen.SETTINGS },
                            onSend = {
                                val text = draft.trim()
                                if (text.isNotEmpty() && !busy) {
                                    draft = ""
                                    messages.add(ChatMessage("user", text))
                                    status = null
                                    if (apiKey.isBlank()) {
                                        status = "Add your API key in Settings to get AI responses. Your key stays in memory for this session only."
                                    } else {
                                        busy = true
                                        val history = messages.toList()
                                        Thread {
                                            val result = requestChat(baseUrl, apiKey, model, history)
                                            android.os.Handler(android.os.Looper.getMainLooper()).post {
                                                result.onSuccess { answer -> messages.add(ChatMessage("assistant", answer)) }
                                                    .onFailure { error ->
                                                        if (error is HttpStatusException && error.statusCode == 402) {
                                                            screen = Screen.PAYMENT_REQUIRED
                                                        } else if (error is HttpStatusException && error.statusCode == 404) {
                                                            screen = Screen.NOT_FOUND
                                                        } else {
                                                            status = error.message ?: "Request failed. Check your connection and settings."
                                                        }
                                                    }
                                                busy = false
                                            }
                                        }.start()
                                    }
                                }
                            }
                        )
                        status?.let { StatusNote(it) }
                        }
                    }
                    Screen.PROJECTS -> ProjectsScreen(modifier = Modifier.fillMaxSize(), onStartChat = { screen = Screen.CHAT })
                    Screen.SETTINGS -> SettingsScreen(
                        modifier = Modifier.fillMaxSize(),
                        baseUrl = baseUrl,
                        onBaseUrlChange = { baseUrl = it },
                        model = model,
                        onModelChange = { model = it },
                        apiKey = apiKey,
                        onApiKeyChange = { apiKey = it },
                        onBack = { screen = Screen.CHAT },
                        onPreview404 = { screen = Screen.NOT_FOUND },
                        onPreview402 = { screen = Screen.PAYMENT_REQUIRED }
                    )
                    Screen.NOT_FOUND -> ErrorPage(
                        code = "404",
                        title = "This page wandered off.",
                        message = "The page you’re looking for doesn’t exist or may have moved.",
                        actionLabel = "Back to chat",
                        onAction = { screen = Screen.CHAT }
                    )
                    Screen.PAYMENT_REQUIRED -> ErrorPage(
                        code = "402",
                        title = "A plan is required.",
                        message = "This service requires payment or a different plan. Check your provider’s billing and model access.",
                        actionLabel = "Open settings",
                        onAction = { screen = Screen.SETTINGS }
                    )
                }
                }
                if (screen != Screen.NOT_FOUND && screen != Screen.PAYMENT_REQUIRED) {
                    BottomBar(screen = screen, onSelect = { screen = it })
                }
            }
        }
    }

    LaunchedEffect(messages.size, busy) {
        if (messages.isNotEmpty()) listState.animateScrollToItem(messages.lastIndex)
    }
}

@Composable
private fun TopBar(screen: Screen, onBack: () -> Unit, onNewChat: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().background(Ink).statusBarsPadding().padding(horizontal = 18.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(11.dp)) {
            Box(modifier = Modifier.size(38.dp).clip(RoundedCornerShape(13.dp)).background(Accent.copy(alpha = .15f)), contentAlignment = Alignment.Center) {
                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Accent, modifier = Modifier.size(21.dp))
            }
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text("loomdesign", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = TextMain)
                Text(when (screen) { Screen.CHAT -> "AI workspace"; Screen.PROJECTS -> "Your projects"; Screen.SETTINGS -> "Preferences"; Screen.NOT_FOUND -> "Page not found"; Screen.PAYMENT_REQUIRED -> "Plan required" }, fontSize = 12.sp, color = TextMuted)
            }
        }
        if (screen == Screen.CHAT) {
            IconButton(onClick = onNewChat) {
                Icon(Icons.Default.Add, contentDescription = "New chat", tint = TextMain)
            }
        } else {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = TextMain) }
        }
    }
    HorizontalDivider(color = Color.White.copy(alpha = .07f))
}

@Composable
private fun WelcomeIntro() {
    Column(modifier = Modifier.fillMaxWidth().padding(top = 16.dp, bottom = 8.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
        Text("A little less setup.\nA lot more creating.", color = TextMain, fontSize = 29.sp, lineHeight = 35.sp, fontWeight = FontWeight.Bold)
        Text("Describe what you need in plain language. We’ll work through it together.", color = TextMuted, fontSize = 14.sp, lineHeight = 21.sp)
    }
}

@Composable
private fun MessageBubble(message: ChatMessage) {
    val isUser = message.role == "user"
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start) {
        if (!isUser) {
            Box(modifier = Modifier.padding(top = 2.dp, end = 8.dp).size(28.dp).clip(CircleShape).background(Accent.copy(alpha = .15f)), contentAlignment = Alignment.Center) {
                Icon(Icons.Default.AutoAwesome, contentDescription = "Assistant", tint = Accent, modifier = Modifier.size(15.dp))
            }
        }
        Column(
            modifier = Modifier.widthIn(max = 310.dp).clip(RoundedCornerShape(18.dp)).background(if (isUser) UserBubble else Panel).padding(horizontal = 14.dp, vertical = 12.dp)
        ) {
            if (!isUser) Text("LOOMDESIGN", color = Accent, fontSize = 10.sp, letterSpacing = 1.2.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(if (isUser) 0.dp else 6.dp))
            Text(message.content, color = TextMain, fontSize = 14.sp, lineHeight = 21.sp)
        }
    }
}

@Composable
private fun Suggestion(label: String, icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Panel).clickable(onClick = onClick).padding(horizontal = 13.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(11.dp)
    ) {
        Icon(icon, contentDescription = null, tint = Accent, modifier = Modifier.size(19.dp))
        Text(label, color = TextMain, fontSize = 13.sp, modifier = Modifier.weight(1f))
        Text("↗", color = TextMuted, fontSize = 16.sp)
    }
}

@Composable
private fun Composer(value: String, onValueChange: (String) -> Unit, busy: Boolean, onSettings: () -> Unit, onSend: () -> Unit) {
    Column(modifier = Modifier.fillMaxWidth().background(Ink).padding(horizontal = 14.dp, vertical = 10.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Panel).border(1.dp, Color.White.copy(alpha = .08f), RoundedCornerShape(22.dp)).padding(start = 15.dp, end = 8.dp, top = 9.dp, bottom = 9.dp),
            verticalAlignment = Alignment.Bottom
        ) {
            BasicTextField(
                value = value,
                onValueChange = onValueChange,
                modifier = Modifier.weight(1f).heightIn(min = 42.dp, max = 120.dp).padding(top = 10.dp, bottom = 6.dp),
                textStyle = androidx.compose.ui.text.TextStyle(color = TextMain, fontSize = 14.sp, lineHeight = 20.sp),
                cursorBrush = androidx.compose.ui.graphics.SolidColor(Accent),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send, keyboardType = KeyboardType.Text),
                keyboardActions = KeyboardActions(onSend = { onSend() }),
                decorationBox = { inner ->
                    Box {
                        if (value.isEmpty()) Text("Message loomdesign…", color = TextMuted, fontSize = 14.sp)
                        inner()
                    }
                }
            )
            Spacer(Modifier.width(8.dp))
            IconButton(onClick = onSettings, modifier = Modifier.size(40.dp)) {
                Icon(Icons.Default.Tune, contentDescription = "AI settings", tint = TextMuted, modifier = Modifier.size(19.dp))
            }
            IconButton(
                onClick = onSend,
                enabled = value.trim().isNotEmpty() && !busy,
                modifier = Modifier.size(40.dp).clip(CircleShape).background(if (value.trim().isNotEmpty() && !busy) Accent else Panel2)
            ) {
                Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send message", tint = if (value.trim().isNotEmpty() && !busy) Ink else TextMuted, modifier = Modifier.size(18.dp))
            }
        }
        Text("AI can make mistakes · Review code before running it", color = TextMuted, fontSize = 10.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth().padding(top = 9.dp, bottom = 2.dp))
    }
}

@Composable
private fun TypingIndicator() {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(9.dp), modifier = Modifier.padding(vertical = 6.dp)) {
        CircularProgressIndicator(modifier = Modifier.size(16.dp), color = Accent, strokeWidth = 2.dp)
        Text("Thinking…", color = TextMuted, fontSize = 13.sp)
    }
}

@Composable
private fun StatusNote(text: String) {
    Row(modifier = Modifier.fillMaxWidth().background(Color(0xFF2B2830)).padding(horizontal = 16.dp, vertical = 10.dp), verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Icon(Icons.Default.Tune, contentDescription = null, tint = Accent, modifier = Modifier.size(17.dp))
        Text(text, color = TextMain, fontSize = 12.sp, lineHeight = 17.sp)
    }
}

@Composable
private fun ProjectsScreen(modifier: Modifier = Modifier, onStartChat: () -> Unit) {
    Column(modifier = modifier.fillMaxWidth().padding(22.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Box(modifier = Modifier.size(68.dp).clip(RoundedCornerShape(22.dp)).background(Panel), contentAlignment = Alignment.Center) {
            Icon(Icons.Default.FolderOpen, contentDescription = null, tint = Accent, modifier = Modifier.size(31.dp))
        }
        Spacer(Modifier.height(18.dp))
        Text("Your projects, in one place", color = TextMain, fontSize = 20.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
        Spacer(Modifier.height(8.dp))
        Text("Project syncing and local file access aren’t connected yet. Start a chat to plan or prototype your next idea.", color = TextMuted, fontSize = 14.sp, lineHeight = 21.sp, textAlign = TextAlign.Center)
        Spacer(Modifier.height(20.dp))
        Button(onClick = onStartChat, shape = RoundedCornerShape(14.dp), colors = ButtonDefaults.buttonColors(containerColor = Accent, contentColor = Ink)) {
            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
            Text("Start a chat", fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun ErrorPage(
    code: String,
    title: String,
    message: String,
    actionLabel: String,
    onAction: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(horizontal = 28.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier.size(112.dp).clip(RoundedCornerShape(28.dp))
                .background(Panel).border(1.dp, Color.White.copy(alpha = 0.10f), RoundedCornerShape(28.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(code, color = Accent, fontSize = 34.sp, fontWeight = FontWeight.Bold, letterSpacing = (-1).sp)
        }
        Spacer(Modifier.height(28.dp))
        Text(title, color = TextMain, fontSize = 24.sp, lineHeight = 30.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
        Spacer(Modifier.height(10.dp))
        Text(message, color = TextMuted, fontSize = 14.sp, lineHeight = 21.sp, textAlign = TextAlign.Center)
        Spacer(Modifier.height(24.dp))
        Button(
            onClick = onAction,
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Accent, contentColor = Ink),
            modifier = Modifier.fillMaxWidth().height(50.dp)
        ) {
            Text(actionLabel, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun SettingsScreen(
    modifier: Modifier = Modifier,
    baseUrl: String, onBaseUrlChange: (String) -> Unit,
    model: String, onModelChange: (String) -> Unit,
    apiKey: String, onApiKeyChange: (String) -> Unit,
    onBack: () -> Unit,
    onPreview404: () -> Unit,
    onPreview402: () -> Unit
) {
    Column(modifier = modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(18.dp), verticalArrangement = Arrangement.spacedBy(17.dp)) {
        Text("AI connection", color = TextMain, fontSize = 23.sp, fontWeight = FontWeight.Bold)
        Text("Use an OpenAI-compatible chat API. Your key is kept in memory only and cleared when the app process ends.", color = TextMuted, fontSize = 13.sp, lineHeight = 19.sp)
        SettingsField("API base URL", baseUrl, onBaseUrlChange, placeholder = "https://api.openai.com")
        SettingsField("Model", model, onModelChange, placeholder = "gpt-4o-mini")
        SettingsField("API key", apiKey, onApiKeyChange, placeholder = "Paste your API key", secret = true)
        Row(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Panel).padding(13.dp), horizontalArrangement = Arrangement.spacedBy(9.dp), verticalAlignment = Alignment.Top) {
            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Accent, modifier = Modifier.size(18.dp))
            Text("Use HTTPS endpoints. Never paste a key into a shared screenshot or commit it to source control.", color = TextMuted, fontSize = 12.sp, lineHeight = 17.sp)
        }
        Button(onClick = onBack, modifier = Modifier.fillMaxWidth().height(50.dp), shape = RoundedCornerShape(14.dp), colors = ButtonDefaults.buttonColors(containerColor = Accent, contentColor = Ink)) {
            Text("Save and return to chat", fontWeight = FontWeight.SemiBold)
        }
        Spacer(Modifier.height(4.dp))
        Text("Error page previews", color = TextMain, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
        OutlinedButton(
            onClick = onPreview404,
            modifier = Modifier.fillMaxWidth().height(48.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = TextMain)
        ) { Text("Preview 404 · Page not found") }
        OutlinedButton(
            onClick = onPreview402,
            modifier = Modifier.fillMaxWidth().height(48.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = TextMain)
        ) { Text("Preview 402 · Payment required") }
        Spacer(Modifier.height(12.dp))
        Text("loomdesign · Native Android · Version 0.1.0", color = TextMuted, fontSize = 11.sp, modifier = Modifier.align(Alignment.CenterHorizontally))
    }
}

@Composable
private fun SettingsField(label: String, value: String, onValueChange: (String) -> Unit, placeholder: String, secret: Boolean = false) {
    Column(verticalArrangement = Arrangement.spacedBy(7.dp)) {
        Text(label, color = TextMain, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            placeholder = { Text(placeholder, color = TextMuted) },
            visualTransformation = if (secret) PasswordVisualTransformation() else androidx.compose.ui.text.input.VisualTransformation.None,
            keyboardOptions = KeyboardOptions(keyboardType = if (secret) KeyboardType.Password else KeyboardType.Uri, imeAction = ImeAction.Done),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = TextMain,
                unfocusedTextColor = TextMain,
                focusedBorderColor = Accent,
                unfocusedBorderColor = Color.White.copy(alpha = .12f),
                cursorColor = Accent,
                focusedContainerColor = Panel,
                unfocusedContainerColor = Panel
            ),
            shape = RoundedCornerShape(14.dp)
        )
    }
}

@Composable
private fun BottomBar(screen: Screen, onSelect: (Screen) -> Unit) {
    HorizontalDivider(color = Color.White.copy(alpha = .07f))
    Row(modifier = Modifier.fillMaxWidth().background(Ink).navigationBarsPadding().padding(horizontal = 22.dp, vertical = 8.dp), horizontalArrangement = Arrangement.SpaceAround, verticalAlignment = Alignment.CenterVertically) {
        BottomItem("Chat", Icons.Default.AutoAwesome, screen == Screen.CHAT) { onSelect(Screen.CHAT) }
        BottomItem("Projects", Icons.Default.FolderOpen, screen == Screen.PROJECTS) { onSelect(Screen.PROJECTS) }
        BottomItem("Settings", Icons.Default.Settings, screen == Screen.SETTINGS) { onSelect(Screen.SETTINGS) }
    }
}

@Composable
private fun BottomItem(label: String, icon: androidx.compose.ui.graphics.vector.ImageVector, selected: Boolean, onClick: () -> Unit) {
    Column(modifier = Modifier.clip(RoundedCornerShape(12.dp)).clickable(onClick = onClick).padding(horizontal = 18.dp, vertical = 7.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Icon(icon, contentDescription = label, tint = if (selected) Accent else TextMuted, modifier = Modifier.size(20.dp))
        Text(label, color = if (selected) Accent else TextMuted, fontSize = 10.sp, fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal)
    }
}

private class HttpStatusException(val statusCode: Int, message: String) : Exception(message)

private fun requestChat(baseUrl: String, apiKey: String, model: String, history: List<ChatMessage>): Result<String> {
    return try {
        val endpoint = chatCompletionsEndpoint(baseUrl)
        require(model.isNotBlank()) { "Enter a model name in Settings." }
        val body = JSONObject().put("model", model.trim()).put("messages", JSONArray().apply {
            history.forEach { put(JSONObject().put("role", it.role).put("content", it.content)) }
        }).put("stream", false)
        val connection = (URL(endpoint).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 15000
            readTimeout = 60000
            doOutput = true
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Authorization", "Bearer ${apiKey.trim()}")
        }
        try {
            connection.outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val response = stream.bufferedReader().use { it.readText() }
            if (code !in 200..299) {
                val detail = try { JSONObject(response).optJSONObject("error")?.optString("message") } catch (_: Exception) { null }
                throw HttpStatusException(
                    code,
                    detail?.takeIf { it.isNotBlank() } ?: "AI request failed (HTTP $code). Check the API URL, key, and model."
                )
            }
            val answer = JSONObject(response).getJSONArray("choices").getJSONObject(0).getJSONObject("message").optString("content")
            require(answer.isNotBlank()) { "The model returned an empty response." }
            Result.success(answer)
        } finally {
            connection.disconnect()
        }
    } catch (e: Exception) {
        Result.failure(e)
    }
}
