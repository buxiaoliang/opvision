package org.cmdbuild.workflow.api;

import static java.util.Optional.empty;
import static java.util.Optional.of;
import static org.apache.commons.lang3.StringUtils.isBlank;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.commons.lang3.StringUtils;
import org.cmdbuild.api.fluent.ws.ClassAttribute;
import org.cmdbuild.api.fluent.ws.EntryTypeAttribute;
import org.cmdbuild.api.fluent.ws.FunctionInput;
import org.cmdbuild.api.fluent.ws.FunctionOutput;
import org.cmdbuild.api.fluent.ws.WsFluentApiExecutor.WsType;
import org.cmdbuild.services.soap.AttributeSchema;
import org.cmdbuild.services.soap.ClassSchema;
import org.cmdbuild.services.soap.FunctionSchema;
import org.cmdbuild.services.soap.Lookup;
import org.cmdbuild.services.soap.Private;
import org.cmdbuild.workflow.type.LookupType;

public class SoapSchemaApi implements SchemaApi {

	private enum FunctionParameterMode {
		INPUT("in_"), OUTPUT("out_");

		private final String prefix;

		private FunctionParameterMode(final String prefix) {
			this.prefix = prefix;
		}

		public String addPrefixTo(final String name) {
			return prefix + name;
		}

	}

	private static final String ANY_DESCRIPTION = null;
	private static final boolean NO_PARENT_LIST = false;

	private final Private proxy;

	private final Map<String, Map<String, AttributeInfo>> attributesByClass;
	private final Map<String, Map<String, AttributeInfo>> attributesByFunction;

	private final Map<String, List<LookupType>> lookupsByType;
	private final Map<Integer, LookupType> lookupsById;

	public SoapSchemaApi(final Private proxy) {
		this.proxy = proxy;
		this.attributesByClass = new HashMap<String, Map<String, AttributeInfo>>();
		this.attributesByFunction = new HashMap<String, Map<String, AttributeInfo>>();
		this.lookupsByType = new HashMap<String, List<LookupType>>();
		this.lookupsById = new HashMap<Integer, LookupType>();
	}

	@Override
	public ClassInfo findClass(final String className) {
		return toClassInfo(proxy.getClassSchemaByName(className, false));
	}

	@Override
	public ClassInfo findClass(final int classId) {
		return toClassInfo(proxy.getClassSchemaById(classId, false));
	}

	private ClassInfo toClassInfo(final ClassSchema classSchema) {
		return new ClassInfo(classSchema.getName(), classSchema.getId());
	}

	@Override
	public AttributeInfo findAttributeFor(final EntryTypeAttribute entryTypeAttribute) {
		return new EntryTypeAttribute.Visitor() {

			private String entryName;
			private AttributeInfo attributeInfo;

			public AttributeInfo attributeInfo() {
				entryTypeAttribute.accept(this);
				return (attributeInfo == null) ? unknownAttributeInfo(entryName) : attributeInfo;
			}

			private AttributeInfo unknownAttributeInfo(final String entryName) {
				return new AttributeInfo() {

					@Override
					public String getName() {
						return entryName;
					}

					@Override
					public WsType getWsType() {
						return WsType.UNKNOWN;
					}

					@Override
					public Optional<String> getTargetClassName() {
						return empty();
					}

				};
			}

			@Override
			public void visit(final ClassAttribute classAttribute) {
				entryName = classAttribute.getClassName();
				attributeInfo = findAttributeForClass(classAttribute.getClassName(), classAttribute.getAttributeName());
			}

			@Override
			public void visit(final FunctionInput functionInput) {
				entryName = functionInput.getFunctionName();
				attributeInfo = findAttributeForFunction(functionInput.getFunctionName(),
						functionInput.getAttributeName(), FunctionParameterMode.INPUT);
			}

			@Override
			public void visit(final FunctionOutput functionOutput) {
				entryName = functionOutput.getFunctionName();
				attributeInfo = findAttributeForFunction(functionOutput.getFunctionName(),
						functionOutput.getAttributeName(), FunctionParameterMode.OUTPUT);
			}

		}.attributeInfo();
	}

	private AttributeInfo findAttributeForClass(final String className, final String attributeName) {
		if (!attributesByClass.containsKey(className) || !attributesByClass.get(className).containsKey(attributeName)) {
			updateClassAttributesMap(className);
		}
		return attributesByClass.get(className).get(attributeName);
	}

	private void updateClassAttributesMap(final String className) {
		final Map<String, AttributeInfo> attributeInfos = new HashMap<String, SoapSchemaApi.AttributeInfo>();
		final List<AttributeSchema> attributeSchemas = proxy.getAttributeList(className);
		for (final AttributeSchema attributeSchema : attributeSchemas) {
			attributeInfos.put(attributeSchema.getName(), attributeInfoFrom(attributeSchema));
		}
		attributesByClass.put(className, attributeInfos);
	}

	private AttributeInfo findAttributeForFunction(final String functionName, final String attributeName,
			final FunctionParameterMode mode) {
		final String name = mode.addPrefixTo(attributeName);
		if (!attributesByFunction.containsKey(functionName)
				|| !attributesByFunction.get(functionName).containsKey(name)) {
			updateAllFunctionAttributesMap();
		}
		return attributesByFunction.get(functionName).get(name);
	}

	private void updateAllFunctionAttributesMap() {
		final List<FunctionSchema> functionSchemas = proxy.getFunctionList();
		for (final FunctionSchema functionSchema : functionSchemas) {
			final Map<String, AttributeInfo> attributeInfos = new HashMap<String, SoapSchemaApi.AttributeInfo>();
			for (final AttributeSchema attributeSchema : functionSchema.getInput()) {
				final String name = FunctionParameterMode.INPUT.addPrefixTo(attributeSchema.getName());
				attributeInfos.put(name, attributeInfoFrom(attributeSchema));
			}
			for (final AttributeSchema attributeSchema : functionSchema.getOutput()) {
				final String name = FunctionParameterMode.OUTPUT.addPrefixTo(attributeSchema.getName());
				attributeInfos.put(name, attributeInfoFrom(attributeSchema));
			}
			attributesByFunction.put(functionSchema.getName(), attributeInfos);
		}
	}

	private AttributeInfo attributeInfoFrom(final AttributeSchema attributeSchema) {
		return new AttributeInfo() {

			@Override
			public String getName() {
				return attributeSchema.getName();
			}

			@Override
			public WsType getWsType() {
				return WsType.from(attributeSchema.getType());
			}

			@Override
			public Optional<String> getTargetClassName() {
				final String value = attributeSchema.getReferencedClassName();
				return isBlank(value) ? empty() : of(value);
			}

		};
	}

	@Override
	public LookupType selectLookupById(final int id) {
		return convertLookup(proxy.getLookupById(id));
	}

	@Override
	public LookupType selectLookupByCode(final String type, final String code) {
		List<LookupType> lookupList = getLookupsByType(type);
		LookupType lookup = getLookupByCode(lookupList, code);
		if (lookup == null) {
			lookupList = updateLookupType(type);
			lookup = getLookupByCode(lookupList, code);
		}
		return lookup;
	}

	@Override
	public LookupType selectLookupByDescription(final String type, final String description) {
		List<LookupType> lookupList = getLookupsByType(type);
		LookupType lookup = getLookupByDescription(lookupList, description);
		if (lookup == null) {
			lookupList = updateLookupType(type);
			lookup = getLookupByDescription(lookupList, description);
		}
		return lookup;
	}

	private List<LookupType> getLookupsByType(final String type) {
		List<LookupType> lookupList = lookupsByType.get(type);
		if (lookupList == null) {
			lookupList = updateLookupType(type);
		}
		return lookupList;
	}

	private List<LookupType> updateLookupType(final String type) {
		final List<Lookup> wsLookupList = proxy.getLookupList(type, ANY_DESCRIPTION, NO_PARENT_LIST);
		final List<LookupType> lookupList = convertLookupList(wsLookupList);
		lookupsByType.put(type, lookupList);
		for (final LookupType lookup : lookupList) {
			lookupsById.put(lookup.getId(), lookup);
		}
		return lookupList;
	}

	private LookupType getLookupByCode(final List<LookupType> lookupList, final String code) {
		for (final LookupType lookup : lookupList) {
			if (StringUtils.equals(code, lookup.getCode())) {
				return lookup;
			}
		}
		return null;
	}

	private LookupType getLookupByDescription(final List<LookupType> lookupList, final String description) {
		for (final LookupType lookup : lookupList) {
			if (StringUtils.equals(description, lookup.getDescription())) {
				return lookup;
			}
		}
		return null;
	}

	private List<LookupType> convertLookupList(final List<Lookup> wsLookupList) {
		final List<LookupType> lookupList = new ArrayList<LookupType>(wsLookupList.size());
		for (final Lookup wsLookup : wsLookupList) {
			lookupList.add(convertLookup(wsLookup));
		}
		return lookupList;
	}

	private LookupType convertLookup(final Lookup wsLookup) {
		if (wsLookup == null) {
			return null;
		}
		final LookupType lookup = new LookupType();
		lookup.setType(wsLookup.getType());
		lookup.setId(wsLookup.getId());
		lookup.setCode(wsLookup.getCode());
		lookup.setDescription(wsLookup.getDescription());
		return lookup;
	}

}
