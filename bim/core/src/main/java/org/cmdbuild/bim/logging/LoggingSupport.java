package org.cmdbuild.bim.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public interface LoggingSupport {

	String LOGGER_NAME = "bim";

	Logger logger = LoggerFactory.getLogger(LOGGER_NAME);

}
