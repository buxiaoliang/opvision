package unit.data.store.email;

import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;

import org.cmdbuild.data.store.email.DelayConverter;
import org.junit.Test;

public class DelayConverterTest {

	@Test
	public void nullConvertedAsNull() throws Exception {
		assertThat(new DelayConverter().convert(null), equalTo(null));
	}

	@Test
	public void nonNullValueConvertedMultipliedBy1000() throws Exception {
		assertThat(new DelayConverter().convert(42), equalTo(42000L));
		assertThat(new DelayConverter().convert(123), equalTo(123000L));
	}

	@Test
	public void nullConvertedBackAsNull() throws Exception {
		assertThat(new DelayConverter().reverse().convert(null), equalTo(null));
	}

	@Test
	public void nonNullValueConvertedBAckDividedBy1000() throws Exception {
		assertThat(new DelayConverter().reverse().convert(42000L), equalTo(42));
		assertThat(new DelayConverter().reverse().convert(123000L), equalTo(123));
	}

}
