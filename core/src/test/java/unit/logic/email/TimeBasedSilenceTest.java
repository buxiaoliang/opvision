package unit.logic.email;

import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;

import org.cmdbuild.logic.email.TimeBasedSilence;
import org.cmdbuild.logic.email.TimeBasedSilence.Configuration;
import org.junit.Test;

public class TimeBasedSilenceTest {

	@Test
	public void statusRestoredAfterFirstCheck() throws Exception {
		// given
		final TimeBasedSilence underTest = new TimeBasedSilence(new Configuration() {

			@Override
			public long millis() {
				return 200L;
			}

		});

		// when/then
		assertThat(underTest.keep(), equalTo(false));
		assertThat(underTest.keep(), equalTo(true));
		assertThat(underTest.keep(), equalTo(true));
		Thread.sleep(1000L);
		assertThat(underTest.keep(), equalTo(false));
		assertThat(underTest.keep(), equalTo(true));
	}

}
