package org.cmdbuild.logic.translation.object;

import java.util.Map;

import org.apache.commons.lang3.Validate;
import org.cmdbuild.logic.translation.BaseTranslation;
import org.cmdbuild.logic.translation.TranslationObjectVisitor;

public class DomainInverseDescription extends BaseTranslation {

	private DomainInverseDescription(final Builder builder) {
		this.setName(builder.domainName);
		this.setTranslations(builder.translations);
	}

	public static Builder newInstance() {
		return new Builder();
	}

	@Override
	public void accept(final TranslationObjectVisitor visitor) {
		visitor.visit(this);
	}

	public static class Builder implements org.apache.commons.lang3.builder.Builder<DomainInverseDescription> {

		private String domainName;
		private Map<String, String> translations;

		private Builder() {
		}

		@Override
		public DomainInverseDescription build() {
			validate();
			return new DomainInverseDescription(this);
		}

		public Builder withDomainName(final String domainName) {
			this.domainName = domainName;
			return this;
		}

		public Builder withTranslations(final Map<String, String> translations) {
			this.translations = translations;
			return this;
		}

		private void validate() {
			Validate.notBlank(domainName);
		}

	}

}
