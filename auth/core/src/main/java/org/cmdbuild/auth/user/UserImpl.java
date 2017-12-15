package org.cmdbuild.auth.user;

import static com.google.common.collect.Lists.newArrayList;
import static com.google.common.collect.Sets.newHashSet;
import static org.apache.commons.lang3.ObjectUtils.defaultIfNull;

import java.time.LocalDateTime;
import java.util.Collection;

import org.apache.commons.lang3.Validate;

import com.google.common.collect.Ordering;

public class UserImpl implements CMUser {

	public static class UserImplBuilder implements org.apache.commons.lang3.builder.Builder<UserImpl> {

		private Long id;
		private String username;
		private String description;
		private String email;
		private Boolean active;
		private Boolean service;
		private Boolean privileged;
		private final Collection<String> groupNames = newHashSet();
		private final Collection<String> groupDescriptions = newArrayList();
		private String defaultGroupName;
		
		private LocalDateTime passwordExpirationTimestamp;
		private LocalDateTime lastPasswordChange;
		private LocalDateTime lastExpiringNotification;

		private UserImplBuilder() {
			// use factory method
		}

		public UserImplBuilder withId(final Long id) {
			this.id = id;
			return this;
		}

		public UserImplBuilder withUsername(final String username) {
			this.username = username;
			return this;
		}

		public UserImplBuilder withDescription(final String description) {
			this.description = description;
			return this;
		}

		public UserImplBuilder withGroupName(final String groupName) {
			this.groupNames.add(groupName);
			return this;
		}

		public UserImplBuilder withGroupDescription(final String groupName) {
			this.groupDescriptions.add(groupName);
			return this;
		}

		public UserImplBuilder withGroupNames(final Collection<String> groupNames) {
			this.groupNames.addAll(groupNames);
			return this;
		}

		public UserImplBuilder withEmail(final String email) {
			this.email = email;
			return this;
		}

		public UserImplBuilder withActiveStatus(final Boolean active) {
			this.active = active;
			return this;
		}

		public UserImplBuilder withServiceStatus(final Boolean service) {
			this.service = service;
			return this;
		}

		public UserImplBuilder withPrivilegedStatus(final Boolean privileged) {
			this.privileged = privileged;
			return this;
		}

		public UserImplBuilder withDefaultGroupName(final String defaultGroupName) {
			this.defaultGroupName = defaultGroupName;
			return this;
		}
		
		public UserImplBuilder withpasswordExpirationTimestamp(final LocalDateTime passwordExpirationTimestamp) {
			this.passwordExpirationTimestamp = passwordExpirationTimestamp;
			return this;
		}
		
		public UserImplBuilder withLastPasswordChange(final LocalDateTime lastPasswordChange) {
			this.lastPasswordChange = lastPasswordChange;
			return this;
		}
		
		public UserImplBuilder withLastExpiringNotification(final LocalDateTime lastExpiringNotification) {
			this.lastExpiringNotification = lastExpiringNotification;
			return this;
		}
		
		

		@Override
		public UserImpl build() {
			validate();
			return new UserImpl(this);
		}

		private void validate() {
			Validate.notNull(username);
			Validate.notNull(description);
			Validate.noNullElements(groupNames);

			active = defaultIfNull(active, true);
			service = defaultIfNull(service, false);
			privileged = defaultIfNull(privileged, false);

			final Collection<String> ordered = Ordering.natural().immutableSortedCopy(groupDescriptions);
			groupDescriptions.clear();
			groupDescriptions.addAll(ordered);
		}

	}

	private final Long id;
	private final String username;
	private final String description;
	private final String email;
	private final boolean active;
	private final boolean service;
	private final boolean privileged;
	private final Collection<String> groupNames;
	private final Collection<String> groupDescriptions;
	private final String defaultGroupName;
	private final LocalDateTime passwordExpirationTimestamp;
	private final LocalDateTime lastPasswordChange;
	private final LocalDateTime lastExpiringNotification;
	

	private UserImpl(final UserImplBuilder builder) {
		this.id = builder.id;
		this.username = builder.username;
		this.description = builder.description;
		this.email = builder.email;
		this.active = builder.active;
		this.service = builder.service;
		this.privileged = builder.privileged;
		this.groupNames = builder.groupNames;
		this.defaultGroupName = builder.defaultGroupName;
		this.groupDescriptions = builder.groupDescriptions;
		this.passwordExpirationTimestamp = builder.passwordExpirationTimestamp;
		this.lastPasswordChange = builder.lastPasswordChange;
		this.lastExpiringNotification = builder.lastExpiringNotification;
	}

	@Override
	public Long getId() {
		return id;
	}

	@Override
	public String getUsername() {
		return this.username;
	}

	@Override
	public String getDescription() {
		return this.description;
	}

	@Override
	public Collection<String> getGroupNames() {
		return this.groupNames;
	}

	@Override
	public Collection<String> getGroupDescriptions() {
		return this.groupDescriptions;
	}

	@Override
	public String getDefaultGroupName() {
		return defaultGroupName;
	}

	@Override
	public String getEmail() {
		return email;
	}

	@Override
	public boolean isActive() {
		return active;
	}

	@Override
	public boolean isService() {
		return service;
	}

	@Override
	public boolean isPrivileged() {
		return privileged;
	}

	public static UserImplBuilder newInstanceBuilder() {
		return new UserImplBuilder();
	}

	@Override
	public boolean equals(final Object obj) {
		if (obj == null) {
			return false;
		}
		if (!CMUser.class.isAssignableFrom(obj.getClass())) {
			return false;
		}
		final CMUser other = CMUser.class.cast(obj);
		return username.equals(other.getUsername());
	}

	@Override
	public int hashCode() {
		return username.hashCode();
	}

	@Override
	public boolean isPasswordExpired() {
		if (passwordExpirationTimestamp != null && LocalDateTime.now().isAfter(passwordExpirationTimestamp)) 
			return true;
		return false;
			
	}

	@Override
	public LocalDateTime getPasswordExpirationTimestamp() {
		return passwordExpirationTimestamp;
	}

	@Override
	public LocalDateTime getLastPasswordChangeTimestamp() {
		return lastPasswordChange;
	}

	@Override
	public LocalDateTime getLastExpiringNotificationTimestamp() {
		return lastExpiringNotification;
	}

}
