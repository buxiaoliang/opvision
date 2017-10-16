# Change Log
All notable changes to this project will be documented in this file.

## [1.2.0]

### Added
- Allow customizations for reference fields.

### Changed
- Removed HTML tags in grids.

### Fixed
- When language is different from "en" or "it" anything is shown.
- Overriding attributes index in grid configuration have no effect.
- Activity backend has problems while disabling first activity property.
- HTML fields are not validated.
- Widgets data is not loaded before validation.
- Error when widget label has apex.
- Cannot advance processes after CMDBuild 2.4.3 release.
- Removed duplicated draft emails on ManageEmail widget.

## [1.1.1]
### Added
- Function on grid row callback.
- Custom form widget.
- Translations management for core code.
- Navigation Tree Widget.
- Reports list form.

###Changed
- Set default value when form is not empty.
- Improve application configurations management.

### Fixed
- DateTime form field gets error while saving when mode is hidden.
- WYSIWYG editor does not works in Firefox.
- Widgets's XML parser does not works in IE.
- Popup buttons don't stay fixed in bottom when scrolling content.

## [1.1.0]
### Added
- Add buttons depending to the form.
- Maxlength attribute for input and textarea.
- Empty grid custom message.
- Icons management.
- Buttons depending to the form.
- Success message on form save.
- Translations on tooltip, dialog, tabbed.

### Changed
- Form fields engine.
- Remove unused files and reorganize files.
- Clear and format main CSS.

### Fixed
- Status filter in grid not working.
- Pagination on grid not works properly.
- CheckBox does not call change for cql table.
- Missing metedata in proxy callback.
- After command advance save id into data model values.

## [1.0.3] - 2015-12-30
### Added
- Proxy method for domains and relations attributes.
- Time picker.
- Management of user variables into template resolver.

### Changed
- Use standard html for references.

## [1.0.2] - 2015-12-15
### Changed
- While load forms get uselessly the processes list.
- Use of getters and setters for components variables.

### Fixed
- Wrong rest url for process attributes.

## [1.0.1] - 2015-11-30
### Added
- New spinner control.

### Fixed
- If the grid is empty the observer doesn't work.
