const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://mhfbtltgwibwmsudsuvf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Iq_aEMAdzRnu9sig32B4WQ_bmez4bgN';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.from('blog_posts').select('*').order('published_at', { ascending: false }).limit(1);
    if (error) {
        console.error(error);
        return;
    }
    console.log("Title:", data[0].title);
    console.log("Slug:", data[0].slug);
    console.log("Content:\n", data[0].content);
}
run();