package org.cmdbuild.bim.mapper.xml;

import java.io.File;
import java.io.StringReader;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.cmdbuild.bim.logging.LoggingSupport;
import org.cmdbuild.bim.mapper.Parser;
import org.cmdbuild.bim.service.BimError;
import org.slf4j.Logger;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;

/**
 * This class can read an XML file in which a set of entities is defines as well
 * as their attributes and possible nested entities
 */
public class XmlParser implements Parser {

	public static final String ROOT = "bim-conf";
	private static final Logger logger = LoggingSupport.logger;

	private static Document xmlDocument;

	private File inputFile;
	private static XPath xPath;

	public XmlParser(final File file) {
		this.inputFile = file;

		final DocumentBuilderFactory domFactory = DocumentBuilderFactory.newInstance();
		DocumentBuilder builder;
		try {
			builder = domFactory.newDocumentBuilder();
			logger.info(inputFile.getAbsolutePath());
			xmlDocument = builder.parse(inputFile);
			final XPathFactory factory = XPathFactory.newInstance();
			xPath = factory.newXPath();
		} catch (final Exception e) {
			throw new BimError("Unable to setup XML parser", e);
		}

	}

	public XmlParser(final String xmlString) {
		final InputSource xmlSource = new InputSource(new StringReader(xmlString));

		final DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
		try {
			final DocumentBuilder db = dbf.newDocumentBuilder();
			xmlDocument = db.parse(xmlSource);
			xPath = XPathFactory.newInstance().newXPath();
		} catch (final Exception e) {
			throw new BimError("Invalid XML import mapping", e);
		}
	}

	@Override
	public String getIfcType(final String entityPath) {
		String name = "";
		try {
			name = xPath.evaluate(entityPath + "/@ifcType", xmlDocument);
		} catch (final XPathExpressionException e) {
			throw new BimError("error in getEntityName", e);
		}
		return name;
	}

	@Override
	public String getCmClassName(final String entityPath) {
		String label = "";
		try {
			label = xPath.evaluate(entityPath + "/@cmClass", xmlDocument);
		} catch (final XPathExpressionException e) {
			new BimError("error in getEntityLabel", e);
		}
		return label;
	}

	@Override
	public int getNumberOfNestedEntities(final String nestedEntityPath) {
		int numberOfNestedEntities = 0;
		try {
			numberOfNestedEntities = Integer
					.parseInt(xPath.evaluate("count(" + nestedEntityPath + "/entity)", xmlDocument));
		} catch (final XPathExpressionException e) {
			throw new BimError("error in get entity names", e);
		}
		return numberOfNestedEntities;
	}

	@Override
	public int getNumberOfAttributes(final String entityPath) {
		String numberOfAttributesAsString;
		int numberOfAttributes = 0;
		try {
			numberOfAttributesAsString = xPath.evaluate("count(" + entityPath + "/attributes/attribute)", xmlDocument);
			numberOfAttributes = Integer.parseInt(numberOfAttributesAsString);
		} catch (final XPathExpressionException e) {
			new BimError("error in get number of attributes", e);
		}
		return numberOfAttributes;
	}

	@Override
	public String getIfcAttributeType(final String entityPath, final int i) {
		String type = "";
		try {
			type = xPath.evaluate(entityPath + "/attributes/attribute[" + i + "]/@type", xmlDocument);
			if (type.equals("")) {
				throw new BimError("error reading attribute type for attribute " + i);
			}
		} catch (final XPathExpressionException e) {
			throw new BimError("error reading attribute type for attribute: \"" + i + "\"", e);
		}
		return type;
	}

	@Override
	public String getCmAttributeName(final String entityPath, final int i) {
		String label = "";
		try {
			label = xPath.evaluate(entityPath + "/attributes/attribute[" + i + "]/@cmName", xmlDocument);
		} catch (final XPathExpressionException e) {
			throw new BimError("error reading attribute type for attribute: \"" + i + "\"", e);
		}
		return label;
	}

	@Override
	public String getIfcAttributeValue(final String entityPath, final int i) {
		String value = "";
		try {
			value = xPath.evaluate(entityPath + "/attributes/attribute[" + i + "]/@value", xmlDocument);
		} catch (final XPathExpressionException e) {
			throw new BimError("error reading attribute type for attribute: \"" + i + "\"", e);
		}
		return value;
	}

	@Override
	public String getIfcAttributeName(final String entityPath, final int i) {
		String name = "";
		try {
			name = xPath.evaluate(entityPath + "/attributes/attribute[" + i + "]/@ifcName", xmlDocument);
		} catch (final XPathExpressionException e) {
			throw new BimError("error reading attribute name for attribute: \"" + i + "\"", e);
		}
		return name;
	}

}
