const CACHE_KEY = 'translation-cache';

type TranslationCache = Record<string, string>;

function getCache(): TranslationCache {
    try {
        const raw =
            localStorage.getItem(CACHE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function setCache(cache: TranslationCache) {
    try {
        localStorage.setItem(
            CACHE_KEY,
            JSON.stringify(cache),
        );
    } catch {
        // ignore storage errors
    }
}

async function translateText(
    text: string,
    from = 'en',
    to = 'fa',
): Promise<string> {
    if (!text.trim()) {
        return text;
    }

    const cache = getCache();
    const cacheKey = `${from}|${to}|${text}`;

    if (cache[cacheKey]) {
        return cache[cacheKey];
    }

    try {
        const params = new URLSearchParams({
            q: text,
            langpair: `${from}|${to}`,
        });

        const response =
            await fetch(
                `https://api.mymemory.translated.net/get?${params.toString()}`,
            );

        if (!response.ok) {
            return text;
        }

        const result =
            await response.json();
        const translated =
            result?.responseData?.translatedText ||
            text;

        cache[cacheKey] = translated;
        setCache(cache);

        return translated;
    } catch {
        return text;
    }
}

export async function translateNewsItem(
    item: {
        title: string;
        summary?: string;
    },
    to = 'fa',
): Promise<{
        title: string;
        summary?: string;
    }> {
    const [translatedTitle, translatedSummary] =
        await Promise.all([
            translateText(item.title, 'en', to),
            item.summary
                ? translateText(
                      item.summary,
                      'en',
                      to,
                  )
                : Promise.resolve(item.summary),
        ]);

    return {
        title: translatedTitle,
        summary: translatedSummary,
    };
}
