package org.cmdbuild.logic.translation;

import static com.google.common.collect.Iterables.isEmpty;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.util.Arrays;

import org.cmdbuild.auth.LanguageStore;
import org.cmdbuild.config.CmdbuildConfiguration;

import com.google.common.collect.Lists;

public class DefaultSetupFacade implements SetupFacade {

	private static final String SEPARATOR = ",";

	private final CmdbuildConfiguration cmdbuildConfiguration;
	private final LanguageStore languageStore;

	public DefaultSetupFacade(final CmdbuildConfiguration cmdbuildConfiguration, final LanguageStore languageStore) {
		this.cmdbuildConfiguration = cmdbuildConfiguration;
		this.languageStore = languageStore;
	}

	@Override
	public boolean isEnabled() {
		return !isEmpty(getEnabledLanguages());
	}

	@Override
	public String getLocalization() {
		return languageStore.getLanguage();
	}

	@Override
	public Iterable<String> getEnabledLanguages() {
		String[] enabledLanguagesArray = null;
		String enabledLanguagesConfiguration = EMPTY;
		try {
			enabledLanguagesConfiguration = cmdbuildConfiguration.getEnabledLanguages();
			enabledLanguagesConfiguration = enabledLanguagesConfiguration.replaceAll("\\s", "");
		} catch (final Exception e) {
			e.printStackTrace();
		}
		if (isNotBlank(enabledLanguagesConfiguration)) {
			enabledLanguagesArray = enabledLanguagesConfiguration.split(SEPARATOR);
		}
		Iterable<String> enabledLanguages = Lists.newArrayList();
		if (enabledLanguagesArray != null) {
			enabledLanguages = Arrays.asList(enabledLanguagesArray);
		}
		return enabledLanguages;
	}

}
