package org.cmdbuild.logic.email;

import static org.joda.time.DateTime.now;

import org.cmdbuild.logic.email.SilencedNotifier.Silence;
import org.joda.time.DateTime;

public class TimeBasedSilence implements Silence {

	public static interface Configuration {

		long millis();

	}

	private final Configuration configuration;
	private DateTime silence;

	public TimeBasedSilence(final Configuration configuration) {
		this.configuration = configuration;
		this.silence = now();
	}

	@Override
	public boolean keep() {
		final boolean keep = silence.isAfterNow();
		if (!keep) {
			silence = now().plus(configuration.millis());
		}
		return keep;
	}

}
