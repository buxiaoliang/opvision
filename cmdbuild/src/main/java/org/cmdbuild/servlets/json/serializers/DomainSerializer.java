package org.cmdbuild.servlets.json.serializers;

import static org.cmdbuild.servlets.json.CommunicationConstants.DESCRIPTION;
import static org.cmdbuild.servlets.json.CommunicationConstants.DIRECT_DESCRIPTION;
import static org.cmdbuild.servlets.json.CommunicationConstants.DISABLED1;
import static org.cmdbuild.servlets.json.CommunicationConstants.DISABLED2;
import static org.cmdbuild.servlets.json.CommunicationConstants.INVERSE_DESCRIPTION;
import static org.cmdbuild.servlets.json.schema.Utils.toJsonArray;

import org.cmdbuild.auth.acl.PrivilegeContext;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMDomain;
import org.cmdbuild.dao.view.CMDataView;
import org.json.JSONException;
import org.json.JSONObject;

@_Serializer
public class DomainSerializer {

	private final CMDataView dataView;
	private final PrivilegeContext privilegeContext;

	public DomainSerializer(final CMDataView dataView, final PrivilegeContext privilegeContext) {
		this.dataView = dataView;
		this.privilegeContext = privilegeContext;
	}

	public JSONObject toClient(final CMDomain domain, final boolean activeOnly) throws JSONException {
		return toClient(domain, activeOnly, null);
	}

	public JSONObject toClient(final CMDomain domain, final boolean activeOnly, final String wrapperLabel)
			throws JSONException {
		final JSONObject jsonDomain = new JSONObject();
		jsonDomain.put("idDomain", domain.getId());
		jsonDomain.put("name", domain.getIdentifier().getLocalName());

		jsonDomain.put(DESCRIPTION, domain.getDescription());
		jsonDomain.put(DIRECT_DESCRIPTION, domain.getDescription1());
		jsonDomain.put(INVERSE_DESCRIPTION, domain.getDescription2());

		final CMClass class1 = domain.getClass1();
		if (class1 != null) {
			jsonDomain.put("class1", domain.getClass1().getIdentifier().getLocalName());
			jsonDomain.put("class1id", domain.getClass1().getId());
		}

		final CMClass class2 = domain.getClass2();
		if (class2 != null) {
			jsonDomain.put("class2", domain.getClass2().getIdentifier().getLocalName());
			jsonDomain.put("class2id", domain.getClass2().getId());
		}
		jsonDomain.put(DISABLED1, toJsonArray(domain.getDisabled1()));
		jsonDomain.put(DISABLED2, toJsonArray(domain.getDisabled2()));

		jsonDomain.put("md", domain.isMasterDetail());
		jsonDomain.put("md_label", domain.getMasterDetailDescription());
		jsonDomain.put("active", domain.isActive());
		jsonDomain.put("cardinality", domain.getCardinality());

		jsonDomain.put("active", domain.isActive());
		// FIXME should not be used in this way
		final AttributeSerializer attributeSerializer = AttributeSerializer.newInstance() //
				.withDataView(dataView) //
				.build();

		jsonDomain.put("attributes", attributeSerializer.toClient(domain.getAttributes(), activeOnly));
		jsonDomain.put("system", domain.isSystemButUsable());

		addAccessPrivileges(jsonDomain, domain);
		// TODO: complete ...
		// addMetadata(jsonDomain, domain);

		if (wrapperLabel != null) {
			final JSONObject out = new JSONObject();
			out.put(wrapperLabel, jsonDomain);
			return out;
		} else {
			return jsonDomain;
		}
	}

	private void addAccessPrivileges(final JSONObject jsonObject, final CMDomain domain) throws JSONException {
		final boolean writePrivilege = privilegeContext.hasWriteAccess(domain);
		final boolean createPrivilege = writePrivilege;
		jsonObject.put("priv_write", writePrivilege);
		jsonObject.put("priv_create", createPrivilege);
	}

	public JSONObject toClient(final CMDomain domain, final String className) throws JSONException {
		final JSONObject jsonDomain = toClient(domain, false);
		jsonDomain.put("inherited", !isDomainDefinedForClass(domain, className));
		return jsonDomain;
	}

	public JSONObject toClient(final CMDomain domain) throws JSONException {
		return toClient(domain, false);
	}

	/**
	 * @return true if the domain is defined for the class with provided
	 *         classId, false otherwise (it is defined for a superclass)
	 */
	private static boolean isDomainDefinedForClass(final CMDomain domain, final String className) {
		final CMClass class1 = domain.getClass1();
		final CMClass class2 = domain.getClass2();
		return class1.getName().equals(className) || class2.getName().equals(className);
	}
}
