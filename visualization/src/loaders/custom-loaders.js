import {_GeoJSONLoader as GeoJSONLoader} from "@loaders.gl/json";
import {ZipLoader} from "@loaders.gl/zip";
import JSZip from "jszip";

export const CustomGeoJSONLoader = {
    ...GeoJSONLoader,
    mimeTypes: ['application/json', 'text/plain']
};

export const CustomZippedGeoJSONLoader = {
    ...ZipLoader,
    mimeTypes: ['application/x-zip-compressed', 'application/zip'],
    parse: parseZipAsync
};

async function parseZipAsync(data) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const promises = [];
    const fileMap = {};
    try {
        const jsZip = new JSZip();
        const zip = await jsZip.loadAsync(data, options);
        zip.forEach((relativePath, zipEntry) => {
            const subFilename = zipEntry.name;
            const promise = loadZipEntry(jsZip, subFilename, options).then(arrayBufferOrError => {
                fileMap[relativePath] = arrayBufferOrError;
            });
            promises.push(promise);
        });
        await Promise.all(promises);
        // TODO for now we only process the archive's first JSON file
        // TODO do we need to support multiple files and file types?
        const firstJson = Object.values(fileMap)[0];
        return CustomGeoJSONLoader.parse(firstJson);
    } catch (error) {
        options.log.error(`Unable to read zip archive: ${error}`);
        throw error;
    }
}
async function loadZipEntry(jsZip, subFilename) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    try {
        const arrayBuffer = await jsZip.file(subFilename).async(options.dataType || 'arraybuffer');
        return arrayBuffer;
    } catch (error) {
        options.log.error(`Unable to read ${subFilename} from zip archive: ${error}`);
        return error;
    }
}