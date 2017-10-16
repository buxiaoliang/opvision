package unit.logic.dms;

import static java.util.Arrays.asList;
import static java.util.Collections.emptyList;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.io.File;
import java.io.InputStream;

import javax.activation.DataHandler;
import javax.activation.FileDataSource;

import org.cmdbuild.logic.dms.DmsLogic;
import org.cmdbuild.logic.dms.DmsLogic.Metadata;
import org.cmdbuild.logic.dms.StoreDocument;
import org.cmdbuild.logic.dms.StoreDocument.Builder;
import org.cmdbuild.logic.dms.StoreDocument.Document;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;
import org.mockito.ArgumentCaptor;

public class StoreDocumentTest {

	@Rule
	public TemporaryFolder temporaryFolder = new TemporaryFolder();

	@Test(expected = NullPointerException.class)
	public void dmsLogicIsRequired() throws Exception {
		// given;
		final Builder builder = StoreDocument.newInstance() //
				.withClassName("foo") //
				.withCardId(42L) //
				.withCategory("bar");

		// when
		builder.build();
	}

	@Test(expected = NullPointerException.class)
	public void classNameIsRequired() throws Exception {
		// given
		final DmsLogic dmsLogic = mock(DmsLogic.class);
		final Builder builder = StoreDocument.newInstance() //
				.withDmsLogic(dmsLogic) //
				.withCardId(42L) //
				.withCategory("bar");

		// when
		builder.build();
	}

	@Test(expected = IllegalArgumentException.class)
	public void classNameMustBeNotBlank() throws Exception {
		// given
		final DmsLogic dmsLogic = mock(DmsLogic.class);
		final Builder builder = StoreDocument.newInstance() //
				.withDmsLogic(dmsLogic) //
				.withClassName(" \t") //
				.withCardId(42L) //
				.withCategory("bar");

		// when
		builder.build();
	}

	@Test(expected = NullPointerException.class)
	public void cardIdIsRequired() throws Exception {
		// given
		final DmsLogic dmsLogic = mock(DmsLogic.class);
		final Builder builder = StoreDocument.newInstance() //
				.withDmsLogic(dmsLogic) //
				.withClassName("foo") //
				.withCategory("bar");

		// when
		builder.build();
	}

	@Test(expected = NullPointerException.class)
	public void categoryIsRequired() throws Exception {
		// given
		final DmsLogic dmsLogic = mock(DmsLogic.class);
		final Builder builder = StoreDocument.newInstance() //
				.withDmsLogic(dmsLogic) //
				.withClassName("foo") //
				.withCardId(42L);

		// when
		builder.build();
	}

	@Test(expected = IllegalArgumentException.class)
	public void categoryMustBeNotBlank() throws Exception {
		// given
		final DmsLogic dmsLogic = mock(DmsLogic.class);
		final Builder builder = StoreDocument.newInstance() //
				.withDmsLogic(dmsLogic) //
				.withClassName("foo") //
				.withCardId(42L) //
				.withCategory(" \t");

		// when
		builder.build();
	}

	@Test
	public void whenNoDocumentsAreSpecifiedLogicIsNotInvoked() throws Exception {
		// given
		final DmsLogic dmsLogic = mock(DmsLogic.class);

		// when
		StoreDocument.newInstance() //
				.withDmsLogic(dmsLogic) //
				.withClassName("foo") //
				.withCardId(42L) //
				.withCategory("bar") //
				.build() //
				.execute();

		// then
		verifyNoMoreInteractions(dmsLogic);
	}

	@Test
	public void singleDocumentStored() throws Exception {
		// given
		final DmsLogic dmsLogic = mock(DmsLogic.class);
		final File file = temporaryFolder.newFile();
		final Document document = mock(Document.class);
		when(document.getName()) //
				.thenReturn(file.getName());
		when(document.getDataHandler()) //
				.thenReturn(new DataHandler(new FileDataSource(file)));

		// when
		StoreDocument.newInstance() //
				.withDmsLogic(dmsLogic) //
				.withClassName("foo") //
				.withCardId(42L) //
				.withCategory("bar") //
				.withDocument(document) //
				.build() //
				.execute();

		// then
		final ArgumentCaptor<Metadata> captor = ArgumentCaptor.forClass(Metadata.class);
		verify(dmsLogic).create(eq("system"), eq("foo"), eq(42L), any(InputStream.class), eq(file.getName()),
				captor.capture(), eq(true));

		final Metadata captured = captor.getValue();
		assertThat(captured.category(), equalTo("bar"));
		assertThat(captured.description(), equalTo(EMPTY));
		assertThat(captured.metadataGroups(), equalTo(emptyList()));
	}

	@Test
	public void multipleDocumentsStored() throws Exception {
		// given
		final DmsLogic dmsLogic = mock(DmsLogic.class);

		final File firstFile = temporaryFolder.newFile();
		final Document first = mock(Document.class);
		when(first.getName()) //
				.thenReturn(firstFile.getName());
		when(first.getDataHandler()) //
				.thenReturn(new DataHandler(new FileDataSource(firstFile)));

		final File secondFile = temporaryFolder.newFile();
		final Document second = mock(Document.class);
		when(second.getName()) //
				.thenReturn(secondFile.getName());
		when(second.getDataHandler()) //
				.thenReturn(new DataHandler(new FileDataSource(secondFile)));

		// when
		StoreDocument.newInstance() //
				.withDmsLogic(dmsLogic) //
				.withClassName("foo") //
				.withCardId(42L) //
				.withCategory("bar") //
				.withDocument(first) //
				.withDocuments(asList(second)) //
				.build() //
				.execute();

		// then
		final ArgumentCaptor<Metadata> captor = ArgumentCaptor.forClass(Metadata.class);
		verify(dmsLogic).create(eq("system"), eq("foo"), eq(42L), any(InputStream.class), eq(firstFile.getName()),
				captor.capture(), eq(true));
		verify(dmsLogic).create(eq("system"), eq("foo"), eq(42L), any(InputStream.class), eq(secondFile.getName()),
				captor.capture(), eq(true));

		final Metadata firstCaptured = captor.getAllValues().get(0);
		assertThat(firstCaptured.category(), equalTo("bar"));
		assertThat(firstCaptured.description(), equalTo(EMPTY));
		assertThat(firstCaptured.metadataGroups(), equalTo(emptyList()));

		final Metadata secondCaptured = captor.getAllValues().get(1);
		assertThat(secondCaptured.category(), equalTo("bar"));
		assertThat(secondCaptured.description(), equalTo(EMPTY));
		assertThat(secondCaptured.metadataGroups(), equalTo(emptyList()));
	}

}
