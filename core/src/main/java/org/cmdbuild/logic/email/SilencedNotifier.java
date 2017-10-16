package org.cmdbuild.logic.email;

import static com.google.common.base.Defaults.defaultValue;
import static com.google.common.reflect.Invokable.from;
import static com.google.common.reflect.Reflection.newProxy;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import org.cmdbuild.logic.email.EmailQueueCommand.Notifier;

public class SilencedNotifier extends ForwardingNotifier {

	public static interface Silence {

		boolean keep();

	}

	private final Notifier delegate;

	public SilencedNotifier(final Silence silence, final Notifier inner) {
		this.delegate = newProxy(Notifier.class, new InvocationHandler() {

			@Override
			public Object invoke(final Object proxy, final Method method, final Object[] args) throws Throwable {
				try {
					final Object output;
					if (silence.keep()) {
						output = defaultValue(from(method).getReturnType().getRawType());
					} else {
						output = method.invoke(inner, args);
					}
					return output;
				} catch (final InvocationTargetException e) {
					throw e.getCause();
				}
			}

		});
	}

	@Override
	protected Notifier delegate() {
		return delegate;
	}

}
