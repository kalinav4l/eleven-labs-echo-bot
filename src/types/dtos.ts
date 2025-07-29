
export interface TranslationRequest {
    text: string;
    fromLanguage?: string;
    toLanguage: string;
}

export interface TranslationRequestToMultipleLanguages {
    text: string;
    fromLanguage?: string;
    toLanguages: string[];
}

export interface TranslationResult {
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
}

export interface TranslationResultMultipleLangauges {
    translations: TranslationResult[];
}

export interface PromptGenerationRequest {
    websiteUrl: string;
    agentRole?: string;
    additionalPrompt?: string;
}

export interface PromptGenerationResponse {
    response: string;
}

export interface CreateTextDocumentRequest {
    text: string;
    name: string;
}

export interface CreateDocumentResponse {
    id: string;
    name: string;
}

export interface AgentCreateRequest {
    conversation_config: ConversationConfigCreate;
    name: string;
}

export interface ConversationConfigCreate {
    agent: AgentCreate;
    tts: TtsCreate;
}

export interface AgentCreate {
    language?: string;
    timezone?: string;
    prompt: PromptCreate;
}

export interface PromptCreate {
    prompt: string;
}

export interface TtsCreate {
    model_id: string;
    voice_id: string;
}

export interface AgentCreateResponse {
    agent_id: string;
}

export interface AgentUpdateRequest {
    name?: string;
    conversation_config?: ConversationConfigUpdate;
    platform_settings?: PlatformSettingsUpdate;
    phone_numbers?: string[];
    access_info?: AccessInfoUpdate;
    tags?: string[];
}

export interface ConversationConfigUpdate {
    asr?: AsrConfigUpdate;
    turn?: TurnConfigUpdate;
    tts?: TtsConfigUpdate;
    conversation?: ConversationDetailsUpdate;
    language_presets?: { [key: string]: LanguagePresetUpdate };
    agent?: AgentDetailsUpdate;
}

export interface AsrConfigUpdate {
    quality?: string;
    provider?: string;
    user_input_audio_format?: string;
    keywords?: string[];
}

export interface TurnConfigUpdate {
    turn_timeout?: number;
    silence_end_call_timeout?: number;
    mode?: string;
}

export interface TtsConfigUpdate {
    model_id?: string;
    voice_id?: string;
    supported_voices?: any[];
    agent_output_audio_format?: string;
    optimize_streaming_latency?: number;
    stability?: number;
    speed?: number;
    similarity_boost?: number;
    pronunciation_dictionary_locators?: any[];
}

export interface ConversationDetailsUpdate {
    text_only?: boolean;
    max_duration_seconds?: number;
    client_events?: string[];
}

export interface LanguagePresetUpdate {
    overrides?: LanguageOverridesUpdate;
    first_message_translation?: TranslationUpdate;
}

export interface LanguageOverridesUpdate {
    tts?: any;
    conversation?: any;
    agent?: LanguageAgentOverrideUpdate;
}

export interface LanguageAgentOverrideUpdate {
    first_message?: string;
    language?: string;
    prompt?: string;
}

export interface TranslationUpdate {
    source_hash?: string;
    text?: string;
}

export interface AgentDetailsUpdate {
    first_message?: string;
    language?: string;
    timezone?: string;
    dynamic_variables?: { [key: string]: any };
    prompt?: PromptConfigUpdate;
}

export interface PromptConfigUpdate {
    prompt?: string;
    llm?: string;
    temperature?: number;
    max_tokens?: number;
    tool_ids?: string[];
    built_in_tools?: { [key: string]: any };
    mcp_server_ids?: string[];
    native_mcp_server_ids?: string[];
    knowledge_base?: KnowledgeBaseDocumentUpdate[];
    custom_llm?: any;
    ignore_default_personality?: boolean;
    rag?: RagConfigUpdate;
    tools?: any[];
}

export interface KnowledgeBaseDocumentUpdate {
    type?: string;
    name?: string;
    id?: string;
    usage_mode?: string;
}

export interface RagConfigUpdate {
    enabled?: boolean;
    embedding_model?: string;
    max_vector_distance?: number;
    max_documents_length?: number;
    max_retrieved_rag_chunks_count?: number;
}

export interface PlatformSettingsUpdate {
    auth?: AuthSettingsUpdate;
    evaluation?: EvaluationSettingsUpdate;
    widget?: WidgetSettingsUpdate;
    data_collection?: { [key: string]: any };
    overrides?: OverrideSettingsUpdate;
    call_limits?: CallLimitSettingsUpdate;
    ban?: any;
    privacy?: PrivacySettingsUpdate;
    workspace_overrides?: WorkspaceOverridesUpdate;
    safety?: SafetySettingsUpdate;
}

export interface AuthSettingsUpdate {
    enable_auth?: boolean;
    allowlist?: any[];
    shareable_token?: string;
}

export interface EvaluationSettingsUpdate {
    criteria?: any[];
}

export interface WidgetSettingsUpdate {
    variant?: string;
    placement?: string;
    expandable?: string;
    avatar?: AvatarSettingsUpdate;
    feedback_mode?: string;
    bg_color?: string;
    text_color?: string;
    btn_color?: string;
    btn_text_color?: string;
    border_color?: string;
    focus_color?: string;
    border_radius?: number;
    btn_radius?: number;
    action_text?: string;
    start_call_text?: string;
    end_call_text?: string;
    expand_text?: string;
    listening_text?: string;
    speaking_text?: string;
    shareable_page_text?: string;
    shareable_page_show_terms?: boolean;
    terms_text?: string;
    terms_html?: string;
    terms_key?: string;
    show_avatar_when_collapsed?: boolean;
    disable_banner?: boolean;
    override_link?: string;
    mic_muting_enabled?: boolean;
    transcript_enabled?: boolean;
    text_input_enabled?: boolean;
    text_contents?: TextContentSettingsUpdate;
    styles?: StyleSettingsUpdate;
    language_selector?: boolean;
    supports_text_only?: boolean;
    custom_avatar_path?: string;
    language_presets?: { [key: string]: any };
}

export interface AvatarSettingsUpdate {
    type?: string;
    color_1?: string;
    color_2?: string;
}

export interface TextContentSettingsUpdate {
    main_label?: string;
    start_call?: string;
    new_call?: string;
    end_call?: string;
    mute_microphone?: string;
    change_language?: string;
    collapse?: string;
    expand?: string;
    copied?: string;
    accept_terms?: string;
    dismiss_terms?: string;
    listening_status?: string;
    speaking_status?: string;
    connecting_status?: string;
    input_label?: string;
    input_placeholder?: string;
    user_ended_conversation?: string;
    agent_ended_conversation?: string;
    conversation_id?: string;
    error_occurred?: string;
    copy_id?: string;
}

export interface StyleSettingsUpdate {
    base?: string;
    base_hover?: string;
    base_active?: string;
    base_border?: string;
    base_subtle?: string;
    base_primary?: string;
    base_error?: string;
    accent?: string;
    accent_hover?: string;
    accent_active?: string;
    accent_border?: string;
    accent_subtle?: string;
    accent_primary?: string;
    overlay_padding?: string;
    button_radius?: string;
    input_radius?: string;
    bubble_radius?: string;
    sheet_radius?: string;
    compact_sheet_radius?: string;
    dropdown_sheet_radius?: string;
}

export interface OverrideSettingsUpdate {
    conversation_config_override?: ConversationConfigOverrideUpdate;
    custom_llm_extra_body?: any;
    enable_conversation_initiation_client_data_from_webhook?: any;
}

export interface ConversationConfigOverrideUpdate {
    tts?: { [key: string]: any };
    conversation?: { [key: string]: any };
    agent?: { [key: string]: any };
}

export interface CallLimitSettingsUpdate {
    agent_concurrency_limit?: number;
    daily_limit?: number;
    bursting_enabled?: boolean;
}

export interface PrivacySettingsUpdate {
    record_voice?: boolean;
    retention_days?: number;
    delete_transcript_and_pii?: boolean;
    delete_audio?: boolean;
    apply_to_existing_conversations?: boolean;
    zero_retention_mode?: boolean;
}

export interface WorkspaceOverridesUpdate {
    conversation_initiation_client_data_webhook?: string;
    webhooks?: { [key: string]: string };
}

export interface SafetySettingsUpdate {
    is_blocked_ivc?: boolean;
    is_blocked_non_ivc?: boolean;
    ignore_safety_evaluation?: boolean;
}

export interface AccessInfoUpdate {
    is_creator?: boolean;
    creator_name?: string;
    creator_email?: string;
    role?: string;
}

export interface AgentResponse {
    agent_id: string;
    name: string;
    conversation_config: ConversationConfig;
    metadata: Metadata;
    platform_settings: PlatformSettings;
    phone_numbers: string[];
    access_info: AccessInfo;
    tags: string[];
}

export interface ConversationConfig {
    asr: AsrConfig;
    turn: TurnConfig;
    tts: TtsConfig;
    conversation: ConversationDetails;
    language_presets: { [key: string]: LanguagePreset };
    agent: AgentDetails;
}

export interface AsrConfig {
    quality: string;
    provider: string;
    user_input_audio_format: string;
    keywords: string[];
}

export interface TurnConfig {
    turn_timeout: number;
    silence_end_call_timeout: number;
    mode: string;
}

export interface TtsConfig {
    model_id: string;
    voice_id: string;
    supported_voices: any[];
    agent_output_audio_format: string;
    optimize_streaming_latency: number;
    stability: number;
    speed: number;
    similarity_boost: number;
    pronunciation_dictionary_locators: any[];
}

export interface ConversationDetails {
    text_only: boolean;
    max_duration_seconds: number;
    client_events: string[];
}

export interface LanguagePreset {
    overrides: LanguageOverrides;
    first_message_translation: Translation;
}

export interface LanguageOverrides {
    agent: LanguageAgentOverride;
    tts?: any;
    conversation?: any;
}

export interface LanguageAgentOverride {
    first_message?: string;
    language?: string;
    prompt?: string;
}

export interface Translation {
    source_hash: string;
    text: string;
}

export interface AgentDetails {
    first_message: string;
    language: string;
    timezone?: string;
    dynamic_variables: { [key: string]: any };
    prompt: PromptConfig;
}

export interface PromptConfig {
    prompt: string;
    llm?: string;
    temperature?: number;
    max_tokens?: number;
    tool_ids?: string[];
    built_in_tools?: { [key: string]: any };
    mcp_server_ids?: string[];
    native_mcp_server_ids?: string[];
    knowledge_base?: KnowledgeBaseDocument[];
    custom_llm?: any;
    ignore_default_personality?: boolean;
    rag?: RagConfig;
    tools?: any[];
}

export interface KnowledgeDocumentLocal {
    id: string;
    name: string;
    type: string;
    elevenLabsId?: string;
}

export interface KnowledgeBaseDocument {
    type: string;
    name: string;
    id: string;
    usage_mode?: string;
}

export interface RagConfig {
    enabled: boolean;
    embedding_model: string;
    max_vector_distance: number;
    max_documents_length: number;
    max_retrieved_rag_chunks_count: number;
}

export interface Metadata {
    created_at_unix_secs: number;
}

export interface PlatformSettings {
    auth: AuthSettings;
    evaluation: EvaluationSettings;
    widget: WidgetSettings;
    data_collection: { [key: string]: any };
    overrides: OverrideSettings;
    call_limits: CallLimitSettings;
    ban?: any;
    privacy: PrivacySettings;
    workspace_overrides: WorkspaceOverrides;
    safety: SafetySettings;
}

export interface AuthSettings {
    enable_auth: boolean;
    allowlist: any[];
    shareable_token?: string;
}

export interface EvaluationSettings {
    criteria: any[];
}

export interface WidgetSettings {
    variant: string;
    placement: string;
    expandable: string;
    avatar: AvatarSettings;
    feedback_mode: string;
    bg_color: string;
    text_color: string;
    btn_color: string;
    btn_text_color: string;
    border_color: string;
    focus_color: string;
    border_radius?: number;
    btn_radius?: number;
    action_text?: string;
    start_call_text?: string;
    end_call_text?: string;
    expand_text?: string;
    listening_text?: string;
    speaking_text?: string;
    shareable_page_text?: string;
    shareable_page_show_terms: boolean;
    terms_text: string;
    terms_html: string;
    terms_key?: string;
    show_avatar_when_collapsed: boolean;
    disable_banner: boolean;
    override_link?: string;
    mic_muting_enabled: boolean;
    transcript_enabled: boolean;
    text_input_enabled: boolean;
    text_contents: TextContentSettings;
    styles: StyleSettings;
    language_selector: boolean;
    supports_text_only: boolean;
    custom_avatar_path?: string;
    language_presets: { [key: string]: any };
}

export interface AvatarSettings {
    type: string;
    color_1: string;
    color_2: string;
}

export interface TextContentSettings {
    main_label?: string;
    start_call?: string;
    new_call?: string;
    end_call?: string;
    mute_microphone?: string;
    change_language?: string;
    collapse?: string;
    expand?: string;
    copied?: string;
    accept_terms?: string;
    dismiss_terms?: string;
    listening_status?: string;
    speaking_status?: string;
    connecting_status?: string;
    input_label?: string;
    input_placeholder?: string;
    user_ended_conversation?: string;
    agent_ended_conversation?: string;
    conversation_id?: string;
    error_occurred?: string;
    copy_id?: string;
}

export interface StyleSettings {
    base?: string;
    base_hover?: string;
    base_active?: string;
    base_border?: string;
    base_subtle?: string;
    base_primary?: string;
    base_error?: string;
    accent?: string;
    accent_hover?: string;
    accent_active?: string;
    accent_border?: string;
    accent_subtle?: string;
    accent_primary?: string;
    overlay_padding?: string;
    button_radius?: string;
    input_radius?: string;
    bubble_radius?: string;
    sheet_radius?: string;
    compact_sheet_radius?: string;
    dropdown_sheet_radius?: string;
}

export interface OverrideSettings {
    conversation_config_override: ConversationConfigOverride;
    custom_llm_extra_body?: any;
    enable_conversation_initiation_client_data_from_webhook?: any;
}

export interface ConversationConfigOverride {
    tts?: { [key: string]: any };
    conversation?: { [key: string]: any };
    agent?: { [key: string]: any };
}

export interface CallLimitSettings {
    agent_concurrency_limit: number;
    daily_limit: number;
    bursting_enabled: boolean;
}

export interface PrivacySettings {
    record_voice: boolean;
    retention_days: number;
    delete_transcript_and_pii: boolean;
    delete_audio: boolean;
    apply_to_existing_conversations: boolean;
    zero_retention_mode: boolean;
}

export interface WorkspaceOverrides {
    conversation_initiation_client_data_webhook?: string;
    webhooks: { [key: string]: string };
}

export interface SafetySettings {
    is_blocked_ivc: boolean;
    is_blocked_non_ivc: boolean;
    ignore_safety_evaluation: boolean;
}

export interface AccessInfo {
    is_creator: boolean;
    creator_name: string;
    creator_email: string;
    role: string;
}

export interface KnowledgeBaseResponse {
    documents: KnowledgeBaseDocument[];
}
