import { browser } from '$app/environment';

// 'de' neu ergaenzt. nb/nn bleiben erhalten (strings.ts liefert sie weiterhin),
// werden aber unten aus dem Umschalter-Zyklus genommen.
export type LanguageCode = 'de' | 'en' | 'nb' | 'nn';

const STORAGE_KEY = 'language';
const DEFAULT_LANGUAGE: LanguageCode = 'de';
// Nur Deutsch + Englisch im Toggle. Fuer Norwegisch 'nb','nn' wieder ergaenzen.
const LANGUAGE_ORDER: LanguageCode[] = ['de', 'en'];

export function isLanguageCode(value: unknown): value is LanguageCode {
	return value === 'de' || value === 'en' || value === 'nb' || value === 'nn';
}

function readStoredLanguage(): LanguageCode {
	if (!browser) return DEFAULT_LANGUAGE;
	const stored = localStorage.getItem(STORAGE_KEY);
	return isLanguageCode(stored) ? stored : DEFAULT_LANGUAGE;
}

class LanguageStore {
	code = $state<LanguageCode>(readStoredLanguage());

	get resolved() {
		return this.code;
	}

	get locale() {
		if (this.code === 'en') return 'en-US';
		if (this.code === 'de') return 'de-DE';
		// `nn-NO` faellt in manchen Browsern inkonsistent zurueck; `no-NO`
		// haelt norwegische Datums-/Zeitformatierung stabil.
		return 'no-NO';
	}

	get isEnglish() {
		return this.code === 'en';
	}

	get isGerman() {
		return this.code === 'de';
	}

	get isBokmal() {
		return this.code === 'nb';
	}

	get isNynorsk() {
		return this.code === 'nn';
	}

	// 4. Parameter `de` ist optional: fehlt er (alle bestehenden 517 Aufrufe),
	// wird auf Englisch zurueckgefallen -> App ist sofort lauffaehig,
	// zeigt Deutsch ueberall dort, wo `de` nachgetragen wird.
	text<T>(nb: T, nn: T, en: T, de?: T): T {
		if (this.code === 'de') return de ?? en;
		if (this.code === 'en') return en;
		if (this.code === 'nn') return nn;
		return nb;
	}

	set(next: LanguageCode) {
		this.code = next;
		if (browser) localStorage.setItem(STORAGE_KEY, next);
	}

	toggle() {
		const currentIndex = LANGUAGE_ORDER.indexOf(this.code);
		// Falls aktuell eine nicht-gelistete Sprache (nb/nn) aktiv ist: -1 -> startet bei 'de'
		const next = LANGUAGE_ORDER[(currentIndex + 1) % LANGUAGE_ORDER.length];
		this.set(next ?? DEFAULT_LANGUAGE);
	}
}

export const language = new LanguageStore();
