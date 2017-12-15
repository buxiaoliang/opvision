package org.cmdbuild.bim.service;

import static org.cmdbuild.bim.utils.BimConstants.INVALID_ID;

import org.joda.time.DateTime;

public interface BimProject {

	String getName();

	String getIdentifier();

	String getIfcVersion();

	String getDescription();

	boolean isActive();

	boolean isValid();

	@Override
	String toString();

	DateTime getLastCheckin();

	void setDescription(String decription);

	void setLastCheckin(DateTime lastCheckin);

	final BimProject NULL_PROJECT = new BimProject() {

		@Override
		public String getIdentifier() {
			return INVALID_ID;

		}

		@Override
		public boolean isValid() {
			return false;
		}

		@Override
		public boolean isActive() {
			return false;
		}

		@Override
		public String toString() {
			return getName();
		}

		@Override
		public String getName() {
			return "NULL_PROJECT";
		}

		@Override
		public DateTime getLastCheckin() {
			return null;
		}

		@Override
		public void setLastCheckin(final DateTime lastCheckin) {
			throw new UnsupportedOperationException();
		}

		@Override
		public String getDescription() {
			return getName();
		}

		@Override
		public String getIfcVersion() {
			return null;
		}

		@Override
		public void setDescription(final String description) {
			throw new UnsupportedOperationException();
		}

	};

}
