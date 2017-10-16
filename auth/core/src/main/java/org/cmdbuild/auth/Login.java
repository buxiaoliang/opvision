package org.cmdbuild.auth;

import static java.util.Objects.requireNonNull;
import static java.util.Optional.ofNullable;
import static org.apache.commons.lang3.builder.ToStringBuilder.reflectionToString;
import static org.apache.commons.lang3.builder.ToStringStyle.SHORT_PREFIX_STYLE;

import java.util.function.Supplier;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

public class Login {

	public enum LoginType {

		USERNAME, EMAIL;

	}

	public static class Builder implements org.apache.commons.lang3.builder.Builder<Login> {

		private String value;
		private LoginType type;

		/**
		 * Use factory method.
		 */
		private Builder() {
		}

		@Override
		public Login build() {
			value = requireNonNull(value, "invalid value");
			type = ofNullable(type).orElseGet(new Supplier<LoginType>() {

				@Override
				public LoginType get() {
					return (value.contains("@")) ? LoginType.EMAIL : LoginType.USERNAME;
				}

			});
			return new Login(this);
		}

		public Builder withValue(final String value) {
			this.value = value;
			return this;
		}

		public Builder withType(final LoginType value) {
			this.type = value;
			return this;
		}

	}

	public static Builder newInstance() {
		return new Builder();
	}

	private final String value;
	private final LoginType type;

	private Login(final Builder builder) {
		this.value = builder.value;
		this.type = builder.type;
	}

	public String getValue() {
		return value;
	}

	public LoginType getType() {
		return type;
	}

	@Override
	public boolean equals(final Object obj) {
		if (obj == this) {
			return true;
		}
		if (!(obj instanceof Login)) {
			return false;
		}
		final Login other = Login.class.cast(obj);
		return new EqualsBuilder() //
				.append(this.value, other.value) //
				.append(this.type, other.type) //
				.isEquals();
	}

	@Override
	public int hashCode() {
		return new HashCodeBuilder() //
				.append(value) //
				.append(type) //
				.toHashCode();
	}

	@Override
	public String toString() {
		return reflectionToString(this, SHORT_PREFIX_STYLE);
	}

}
