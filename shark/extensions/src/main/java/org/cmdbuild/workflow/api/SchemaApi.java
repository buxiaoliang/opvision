package org.cmdbuild.workflow.api;

import static org.apache.commons.lang3.builder.ToStringBuilder.reflectionToString;
import static org.apache.commons.lang3.builder.ToStringStyle.SHORT_PREFIX_STYLE;

import java.util.Optional;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.cmdbuild.api.fluent.ws.EntryTypeAttribute;
import org.cmdbuild.api.fluent.ws.WsFluentApiExecutor.WsType;
import org.cmdbuild.workflow.type.LookupType;

import com.google.common.collect.ForwardingObject;

/**
 * API to query the database structure.
 */
public interface SchemaApi {

	/**
	 * Temporary object till we find a decent solution
	 */
	static class ClassInfo {

		private final String name;
		private final long id;

		public ClassInfo(final String name, final long id) {
			this.name = name;
			this.id = id;
		}

		public String getName() {
			return name;
		}

		public long getId() {
			return id;
		}

		@Override
		public boolean equals(final Object obj) {
			if (obj == this) {
				return true;
			}
			if (!(obj instanceof ClassInfo)) {
				return false;
			}
			final ClassInfo other = ClassInfo.class.cast(obj);
			return new EqualsBuilder() //
					.append(this.name, other.name) //
					.append(this.id, other.id) //
					.isEquals();
		}

		@Override
		public int hashCode() {
			return new HashCodeBuilder() //
					.append(name) //
					.append(id) //
					.toHashCode();
		}

		@Override
		public String toString() {
			return reflectionToString(this, SHORT_PREFIX_STYLE);
		}

	}

	interface AttributeInfo {

		String getName();

		WsType getWsType();

		Optional<String> getTargetClassName();

	}

	abstract class ForwardingAttributeInfo extends ForwardingObject implements AttributeInfo {

		/**
		 * Usable by subclasses only.
		 */
		protected ForwardingAttributeInfo() {
		}

		@Override
		protected abstract AttributeInfo delegate();

		@Override
		public String getName() {
			return delegate().getName();
		}

		@Override
		public WsType getWsType() {
			return delegate().getWsType();
		}

		@Override
		public Optional<String> getTargetClassName() {
			return delegate().getTargetClassName();
		}

	}

	ClassInfo findClass(String className);

	ClassInfo findClass(int classId);

	AttributeInfo findAttributeFor(EntryTypeAttribute entryTypeAttribute);

	LookupType selectLookupById(int id);

	LookupType selectLookupByCode(String type, String code);

	LookupType selectLookupByDescription(String type, String description);

}
