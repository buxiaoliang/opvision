package org.cmdbuild.auth;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;

import org.cmdbuild.common.digest.Base64Digester;
import org.cmdbuild.common.digest.Digester;
import org.cmdbuild.dao.entry.CMCard;
import org.joda.time.DateTime;

public abstract class DatabaseAuthenticator extends LegacyDBUserFetcher implements PasswordAuthenticator {

	public static interface Configuration extends LegacyDBUserFetcher.Configuration {

	}

	private static final Digester DIGESTER = new Base64Digester();

	/**
	 * Usable by subclasses only.
	 */
	protected DatabaseAuthenticator() {
	}

	@Override
	protected abstract Configuration configuration();

	@Override
	public String getName() {
		return "DBAuthenticator";
	}

	@Override
	public boolean checkPassword(final Login login, final String password) {
		if (password == null) {
			return false;
		}
		final String encryptedPassword = DIGESTER.encrypt(password);
		final String dbEncryptedPassword = fetchEncryptedPassword(login);
		return encryptedPassword.equals(dbEncryptedPassword);
	}

	@Override
	public String fetchUnencryptedPassword(final Login login) {
		final String dbEncryptedPassword = fetchEncryptedPassword(login);
		return DIGESTER.decrypt(dbEncryptedPassword);
	}

	private String fetchEncryptedPassword(final Login login) {
		try {
			final CMCard userCard = fetchUserCard(login);
			return userCard.get(userPasswordAttribute()).toString();
		} catch (final Exception e) {
			return null;
		}
	}

	@Override
	public PasswordChanger getPasswordChanger(final Login login) {
		return new PasswordChanger() {

			@Override
			public boolean changePassword(final String oldPassword, final String newPassword) {
				return DatabaseAuthenticator.this.changePassword(login, oldPassword, newPassword);
			}

		};
	}

	private boolean changePassword(final Login login, final String oldPassword, final String newPassword) {
		if (checkPassword(login, oldPassword) && PasswordManagementService.isValidPassword(newPassword, login.getValue(), newPassword, oldPassword)) {
			try {
				final String newEncryptedPassword = DIGESTER.encrypt(newPassword);
				final CMCard userCard = fetchUserCard(login);
				if (PasswordManagementService.isPasswordManagementEnabled()) {
					view().update(userCard)
						.set(userPasswordAttribute(), newEncryptedPassword)
						.set(userPasswordExpirationTimestampAttribute(), javaTms2Joda(PasswordManagementService.getPasswordExpiration()))
						.set(userLastPasswordChangeTimestampAttribute(), javaTms2Joda(LocalDateTime.now()))
						.save();
				} else {
					view().update(userCard).set(userPasswordAttribute(), newEncryptedPassword)
					.set(userLastPasswordChangeTimestampAttribute(), javaTms2Joda(LocalDateTime.now()))
					.save();
				}
				return true;
			} catch (final NoSuchElementException e) {
				// let it return false
			}
		}
		return false;
	}
	
	private static DateTime javaTms2Joda (LocalDateTime ldt) {
		if (ldt == null)
			return null;
		return new DateTime(ldt.getYear(), ldt.getMonthValue(), ldt.getDayOfMonth(), ldt.getHour(), ldt.getMinute(), ldt.getSecond());
	}

}
