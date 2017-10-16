package org.cmdbuild.data.store.email;

import com.google.common.base.Converter;

public class DelayConverter extends Converter<Integer, Long> {

	@Override
	protected Long doForward(final Integer input) {
		return input * 1000L;
	}

	@Override
	protected Integer doBackward(final Long input) {
		return Long.valueOf(input / 1000L).intValue();
	}

}
