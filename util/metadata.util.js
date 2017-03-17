const exifParser = require('exif-parser')

function filterMetadata(metadata) {
	console.log(metadata)
	let outputMetadata = {}
	if (metadata.hasOwnProperty('tags')) {
		outputMetadata.lat = metadata.tags.GPSLatitude
		outputMetadata.lng = metadata.tags.GPSLongitude
		outputMetadata.alt = metadata.tags.GPSAltitude
		outputMetadata.make = metadata.tags.Make
		outputMetadata.model = metadata.tags.Model
		outputMetadata.dateTaken = metadata.tags.DateTimeOriginal || metadata.tags.CreateDate
	}
	return outputMetadata
}

module.exports = () => {
	return {
		extractMetadata(picture){
			try {
				let metadata = exifParser.create(picture.buffer).parse()
				return filterMetadata(metadata)
			} catch (error) {
				console.log('Metadata extraction error: ' + error);
			}
		}
	}
}