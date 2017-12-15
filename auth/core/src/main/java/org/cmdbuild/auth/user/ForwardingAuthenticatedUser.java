package org.cmdbuild.auth.user;

import java.time.LocalDateTime;
import org.cmdbuild.auth.PasswordAuthenticator.PasswordChanger;

public abstract class ForwardingAuthenticatedUser extends ForwardingUser implements AuthenticatedUser {

	/**
	 * Usable by subclasses only.
	 */
	protected ForwardingAuthenticatedUser() {
	}

	@Override
	protected abstract AuthenticatedUser delegate();

	@Override
	public boolean isAnonymous() {
		return delegate().isAnonymous();
	}

	@Override
	public void setPasswordChanger(final PasswordChanger passwordChanger) {
		delegate().setPasswordChanger(passwordChanger);
	}

	@Override
	public boolean changePassword(final String oldPassword, final String newPassword) {
		return delegate().changePassword(oldPassword, newPassword);
	}

	@Override
	public boolean canChangePassword() {
		return delegate().canChangePassword();
	}

	@Override
	public boolean isPasswordExpired() {
		return delegate().isPasswordExpired();
	}

	@Override
	public LocalDateTime getLastExpiringNotificationTimestamp() {
		return delegate().getLastExpiringNotificationTimestamp();
	}

	@Override
	public LocalDateTime getLastPasswordChangeTimestamp() {
		return delegate().getLastPasswordChangeTimestamp();
	}

	@Override
	public LocalDateTime getPasswordExpirationTimestamp() {
		return delegate().getPasswordExpirationTimestamp();
	}

}
