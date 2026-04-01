import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://liuxdwtyvequhreitaxh.supabase.co";
const supabaseAnonKey = "sb_publishable_5-V4Hv1-cox0TW0-7xWdsQ_U3QlyYX1";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);