package org.cmdbuild.dao.entrytype;

import static com.google.common.base.Predicates.compose;
import static com.google.common.base.Predicates.equalTo;
import static com.google.common.base.Predicates.instanceOf;
import static com.google.common.base.Predicates.or;
import static org.apache.commons.lang3.builder.ToStringBuilder.reflectionToString;
import static org.apache.commons.lang3.builder.ToStringStyle.SHORT_PREFIX_STYLE;
import static org.cmdbuild.dao.entrytype.Functions.anchestorOf;
import static org.cmdbuild.dao.entrytype.Functions.attributeClassOrder;
import static org.cmdbuild.dao.entrytype.Functions.attributeMode;
import static org.cmdbuild.dao.entrytype.Functions.attributeName;
import static org.cmdbuild.dao.entrytype.Functions.attributeType;
import static org.cmdbuild.dao.entrytype.Functions.baseClass;
import static org.cmdbuild.dao.entrytype.Functions.class1;
import static org.cmdbuild.dao.entrytype.Functions.class2;
import static org.cmdbuild.dao.entrytype.Functions.descendantOf;
import static org.cmdbuild.dao.entrytype.Functions.functionParameterName;
import static org.cmdbuild.dao.entrytype.Functions.id;
import static org.cmdbuild.dao.entrytype.Functions.system;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.cmdbuild.dao.CMTypeObject;
import org.cmdbuild.dao.entrytype.attributetype.CMAttributeType;
import org.cmdbuild.dao.function.CMFunction.CMFunctionParameter;

import com.google.common.base.Function;
import com.google.common.base.Predicate;
import com.google.common.collect.Iterables;

public class Predicates {

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static Predicate<CMAttribute> attributeTypeInstanceOf(final Class<? extends CMAttributeType<?>> clazz) {
		return attribute(attributeType(), instanceOf(clazz));
	}

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static <T extends CMDomain> Predicate<T> domainFor(final CMClass target) {
		return or(domain(class1(), clazz(anchestorOf(target), equalTo(true))),
				domain(class2(), clazz(anchestorOf(target), equalTo(true))));
	}

	private static class Contains implements Predicate<Iterable<String>> {

		private final String value;

		public Contains(final String value) {
			this.value = value;
		}

		@Override
		public boolean apply(final Iterable<String> input) {
			return Iterables.contains(input, value);
		}

		@Override
		public boolean equals(final Object obj) {
			if (obj == this) {
				return true;
			}
			if (!(obj instanceof Contains)) {
				return false;
			}
			final Contains other = Contains.class.cast(obj);
			return new EqualsBuilder() //
					.append(this.value, other.value) //
					.isEquals();
		}

		@Override
		public int hashCode() {
			return new HashCodeBuilder() //
					.append(value) //
					.toHashCode();
		}

		@Override
		public final String toString() {
			return reflectionToString(this, SHORT_PREFIX_STYLE);
		}

	}

	public static Predicate<Iterable<String>> contains(final String value) {
		return new Contains(value);
	}

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static <T extends CMEntryType> Predicate<T> isSystem() {
		return isSystem(equalTo(true));
	}

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static <T extends CMAttribute> Predicate<T> name(final Predicate<String> delegate) {
		return attribute(attributeName(), delegate);
	}

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static <T extends CMAttribute> Predicate<T> classOrder(final Predicate<Integer> delegate) {
		return attribute(attributeClassOrder(), delegate);
	}

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static <T extends CMAttribute> Predicate<T> mode(final Predicate<CMAttribute.Mode> delegate) {
		return attribute(attributeMode(), delegate);
	}

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static <T extends CMTypeObject> Predicate<T> functionId(final Predicate<Long> delegate) {
		return typeObject(id(), delegate);
	}

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static <T extends CMFunctionParameter> Predicate<T> parameterName(final Predicate<String> delegate) {
		return functionParameter(functionParameterName(), delegate);
	}

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static <T extends CMEntryType> Predicate<T> isSystem(final Predicate<Boolean> delegate) {
		return entryType(system(), delegate);
	}

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static <T extends CMEntryType> Predicate<T> isBaseClass(final Predicate<Boolean> delegate) {
		return entryType(baseClass(), delegate);
	}

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static <T extends CMClass> Predicate<T> hasAnchestor(final T value) {
		return clazz(descendantOf(value), equalTo(true));
	}

	/**
	 * Syntactic sugar for
	 * {@link org.cmdbuild.common.utils.guava.Predicates.compose}.
	 */
	public static <F extends CMEntryType, T> Predicate<F> entryType(final Function<F, ? extends T> function,
			final Predicate<T> predicate) {
		return compose(predicate, function);
	}

	/**
	 * Syntactic sugar for
	 * {@link org.cmdbuild.common.utils.guava.Predicates.compose}.
	 */
	public static <F extends CMClass, T> Predicate<F> clazz(final Function<F, ? extends T> function,
			final Predicate<T> predicate) {
		return compose(predicate, function);
	}

	/**
	 * Syntactic sugar for
	 * {@link org.cmdbuild.common.utils.guava.Predicates.compose}.
	 */
	public static <F extends CMDomain, T> Predicate<F> domain(final Function<F, ? extends T> function,
			final Predicate<T> predicate) {
		return compose(predicate, function);
	}

	/**
	 * Syntactic sugar for
	 * {@link org.cmdbuild.common.utils.guava.Predicates.compose}.
	 */
	public static <F extends CMAttribute, T> Predicate<F> attribute(final Function<F, ? extends T> function,
			final Predicate<T> predicate) {
		return compose(predicate, function);
	}

	/**
	 * Syntactic sugar for
	 * {@link org.cmdbuild.common.utils.guava.Predicates.compose}.
	 */
	public static <F extends CMTypeObject, T> Predicate<F> typeObject(final Function<F, ? extends T> function,
			final Predicate<T> predicate) {
		return compose(predicate, function);
	}

	/**
	 * Syntactic sugar for
	 * {@link org.cmdbuild.common.utils.guava.Predicates.compose}.
	 */
	public static <F extends CMFunctionParameter, T> Predicate<F> functionParameter(
			final Function<F, ? extends T> function, final Predicate<T> predicate) {
		return compose(predicate, function);
	}

	private Predicates() {
		// prevents instantiation
	}

}
