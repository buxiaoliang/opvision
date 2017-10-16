package org.cmdbuild.dao.entrytype;

import static com.google.common.collect.FluentIterable.from;
import static com.google.common.collect.Sets.newHashSet;
import static org.apache.commons.lang3.builder.ToStringBuilder.reflectionToString;
import static org.apache.commons.lang3.builder.ToStringStyle.SHORT_PREFIX_STYLE;

import java.util.Collection;

import org.cmdbuild.dao.CMTypeObject;
import org.cmdbuild.dao.entrytype.CMAttribute.Mode;
import org.cmdbuild.dao.entrytype.attributetype.CMAttributeType;
import org.cmdbuild.dao.function.CMFunction.CMFunctionParameter;

import com.google.common.base.Function;

public class Functions {

	private static abstract class AbstractFunction<F, T> implements Function<F, T> {

		/**
		 * Usable by subclasses only.
		 */
		protected AbstractFunction() {
		}

		@Override
		public final String toString() {
			return reflectionToString(this, SHORT_PREFIX_STYLE);
		}

	}

	private static class CMClassAllParentsFunction<T extends CMClass> extends AbstractFunction<T, Iterable<CMClass>> {

		@Override
		public Iterable<CMClass> apply(final T input) {
			final Collection<CMClass> output = newHashSet();
			for (CMClass parent = input.getParent(); parent != null; parent = parent.getParent()) {
				output.add(parent);
			}
			return output;
		}

	}

	private static class CMEntyTypeName<T extends CMEntryType> extends AbstractFunction<T, String> {

		@Override
		public String apply(final T input) {
			return input.getName();
		}

	}

	private static class CMEntyTypeNames<T extends CMEntryType>
			extends AbstractFunction<Iterable<T>, Iterable<String>> {

		@Override
		public Iterable<String> apply(final Iterable<T> input) {
			return from(input) //
					.transform(name());
		}

	}

	private static class CMEntyTypeAttribute extends AbstractFunction<String, CMAttribute> {

		private final CMEntryType entryType;

		public CMEntyTypeAttribute(final CMEntryType entryType) {
			this.entryType = entryType;
		}

		@Override
		public CMAttribute apply(final String input) {
			return (entryType == null) ? null : entryType.getAttribute(input);
		}

	}

	@SuppressWarnings("rawtypes")
	private static final CMClassAllParentsFunction ALL_PARENTS = new CMClassAllParentsFunction<>();
	@SuppressWarnings("rawtypes")
	private static final CMEntyTypeNames NAMES = new CMEntyTypeNames<>();

	@SuppressWarnings("unchecked")
	public static Function<CMClass, Iterable<CMClass>> allParents() {
		return ALL_PARENTS;
	}

	public static <T extends CMEntryType> Function<T, String> name() {
		return new CMEntyTypeName<T>();
	}

	@SuppressWarnings("unchecked")
	public static Function<Iterable<? extends CMEntryType>, Iterable<String>> names() {
		return NAMES;
	}

	public static Function<String, CMAttribute> attribute(final CMEntryType entryType) {
		return new CMEntyTypeAttribute(entryType);
	}

	private static class AttributeName<T extends CMAttribute> extends AbstractFunction<T, String> {

		@Override
		public String apply(final T input) {
			return input.getName();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final AttributeName ATTRIBUTE_NAME = new AttributeName<>();

	@SuppressWarnings("unchecked")
	public static <T extends CMAttribute> Function<T, String> attributeName() {
		return ATTRIBUTE_NAME;
	}

	private static class IsDescendant<T extends CMClass> extends AbstractFunction<T, Boolean> {

		private final T value;

		public IsDescendant(final T anchestor) {
			this.value = anchestor;
		}

		@Override
		public Boolean apply(final T input) {
			return value.isAncestorOf(input);
		}

	}

	public static <T extends CMClass> Function<T, Boolean> descendantOf(final T value) {
		return new IsDescendant<T>(value);
	}

	private static class IsAnchestor<T extends CMClass> extends AbstractFunction<T, Boolean> {

		private final T value;

		private IsAnchestor(final T source) {
			this.value = source;
		}

		@Override
		public Boolean apply(final T input) {
			return input.isAncestorOf(value);
		}

	}

	public static <T extends CMClass> Function<T, Boolean> anchestorOf(final T value) {
		return new IsAnchestor<T>(value);
	}

	private static class Class1<T extends CMDomain> extends AbstractFunction<T, CMClass> {

		private Class1() {
		}

		@Override
		public CMClass apply(final T input) {
			return input.getClass1();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final Class1 CLASS_1 = new Class1<>();

	@SuppressWarnings("unchecked")
	public static <T extends CMDomain> Function<T, CMClass> class1() {
		return CLASS_1;
	}

	private static class Class2<T extends CMDomain> extends AbstractFunction<T, CMClass> {

		private Class2() {
		}

		@Override
		public CMClass apply(final T input) {
			return input.getClass2();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final Class2 CLASS_2 = new Class2<>();

	@SuppressWarnings("unchecked")
	public static <T extends CMDomain> Function<T, CMClass> class2() {
		return CLASS_2;
	}

	private static class Disabled1<T extends CMDomain> extends AbstractFunction<T, Iterable<String>> {

		private Disabled1() {
		}

		@Override
		public Iterable<String> apply(final T input) {
			return input.getDisabled1();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final Disabled1 DISABLED_1 = new Disabled1<>();

	@SuppressWarnings("unchecked")
	public static <T extends CMDomain> Function<T, Iterable<String>> disabled1() {
		return DISABLED_1;
	}

	private static class Disabled2<T extends CMDomain> extends AbstractFunction<T, Iterable<String>> {

		private Disabled2() {
		}

		@Override
		public Iterable<String> apply(final T input) {
			return input.getDisabled2();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final Disabled2 DISABLED_2 = new Disabled2<>();

	@SuppressWarnings("unchecked")
	public static <T extends CMDomain> Function<T, Iterable<String>> disabled2() {
		return DISABLED_2;
	}

	private static class Active<T extends Deactivable> extends AbstractFunction<T, Boolean> {

		@Override
		public Boolean apply(final T input) {
			return input.isActive();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final Active ACTIVE = new Active<>();

	@SuppressWarnings("unchecked")
	public static <T extends Deactivable> Function<T, Boolean> active() {
		return ACTIVE;
	}

	private static class BaseClass<T extends CMEntryType> extends AbstractFunction<T, Boolean> {

		@Override
		public Boolean apply(final T input) {
			return input.isBaseClass();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final BaseClass BASE_CLASS = new BaseClass<>();

	@SuppressWarnings("unchecked")
	public static <T extends CMEntryType> Function<T, Boolean> baseClass() {
		return BASE_CLASS;
	}

	private static class System<T extends CMEntryType> extends AbstractFunction<T, Boolean> {

		@Override
		public Boolean apply(final T input) {
			return input.isSystem();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final System SYSTEM = new System<>();

	@SuppressWarnings("unchecked")
	public static <T extends CMEntryType> Function<T, Boolean> system() {
		return SYSTEM;
	}

	private static class SystemButUsable<T extends CMEntryType> extends AbstractFunction<T, Boolean> {

		@Override
		public Boolean apply(final T input) {
			return input.isSystemButUsable();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final SystemButUsable SYSTEM_BUT_USABLE = new SystemButUsable<>();

	@SuppressWarnings("unchecked")
	public static <T extends CMEntryType> Function<T, Boolean> systemButUsable() {
		return SYSTEM_BUT_USABLE;
	}

	private static class Id<T extends CMTypeObject> extends AbstractFunction<T, Long> {

		@Override
		public Long apply(final T input) {
			return input.getId();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final Id ID = new Id<>();

	@SuppressWarnings("unchecked")
	public static <T extends CMTypeObject> Function<T, Long> id() {
		return ID;
	}

	private static class FunctionParameterName<T extends CMFunctionParameter> extends AbstractFunction<T, String> {

		@Override
		public String apply(final T input) {
			return input.getName();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final FunctionParameterName FUNCTION_PARAMETER_NAME = new FunctionParameterName<>();

	@SuppressWarnings("unchecked")
	public static <T extends CMFunctionParameter> Function<T, String> functionParameterName() {
		return FUNCTION_PARAMETER_NAME;
	}

	private static class AttributeMode<T extends CMAttribute> extends AbstractFunction<T, CMAttribute.Mode> {

		@Override
		public Mode apply(final T input) {
			return input.getMode();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final AttributeMode ATTRIBUTE_MODE = new AttributeMode<>();

	@SuppressWarnings("unchecked")
	public static <T extends CMAttribute> Function<T, CMAttribute.Mode> attributeMode() {
		return ATTRIBUTE_MODE;
	}

	private static class ClassOrder<T extends CMAttribute> extends AbstractFunction<T, Integer> {

		@Override
		public Integer apply(final T input) {
			return input.getClassOrder();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final ClassOrder CLASS_ORDER = new ClassOrder<>();

	@SuppressWarnings("unchecked")
	public static <T extends CMAttribute> Function<T, Integer> attributeClassOrder() {
		return CLASS_ORDER;
	}

	private static class AttributeType<T extends CMAttribute> extends AbstractFunction<T, CMAttributeType<?>> {

		@Override
		public CMAttributeType<?> apply(final T input) {
			return input.getType();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final AttributeType ATTRIBUTETYPE = new AttributeType<>();

	@SuppressWarnings("unchecked")
	public static <T extends CMAttribute> Function<T, CMAttributeType<?>> attributeType() {
		return ATTRIBUTETYPE;
	}

	private static class Cardinality<T extends CMDomain> extends AbstractFunction<T, String> {

		@Override
		public String apply(final T input) {
			return input.getCardinality();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final Cardinality CARDINALITY = new Cardinality<>();

	@SuppressWarnings("unchecked")
	public static <T extends CMDomain> Function<T, String> cardinality() {
		return CARDINALITY;
	}

	private Functions() {
		// prevents instantiation
	}

}
