package org.cmdbuild.logic.email;

import static com.google.common.base.Defaults.defaultValue;
import static com.google.common.reflect.Invokable.from;
import static com.google.common.reflect.Reflection.newProxy;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import org.cmdbuild.logic.email.EmailQueueCommand.Notifier;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

public class ForgivingNotifier extends ForwardingNotifier {

	private static final Marker MARKER = MarkerFactory.getMarker(ForgivingNotifier.class.getName());

	private final Notifier delegate;

	public ForgivingNotifier(final Notifier delegate) {
		this.delegate = newProxy(Notifier.class, new InvocationHandler() {

			@Override
			public Object invoke(final Object proxy, final Method method, final Object[] args) throws Throwable {
				try {
					return method.invoke(delegate, args);
				} catch (final InvocationTargetException e) {
					logger.error(MARKER, "error invoking method, forgiven", e);
					return defaultValue(from(method).getReturnType().getRawType());
				}
			}

		});
	}

	@Override
	protected Notifier delegate() {
		return delegate;
	}

}
