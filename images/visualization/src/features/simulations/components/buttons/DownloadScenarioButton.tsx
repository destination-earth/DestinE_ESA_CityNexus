import React, {useState} from "react";
import {FaDownload, FaSpinner} from "react-icons/fa";
import {DATA_URL, LOADING_SAMPLE_ERROR_MESSAGE} from "../../../../constants/default-settings";
import {saveAs} from 'file-saver';
import JSZip from 'jszip';
import {loadRemoteConfig, loadRemoteData, loadRemoteResourceError} from "../../../../actions"
import {useDispatch} from "react-redux";

function addToZip(zip, fileName, fileData) {
    if (fileData) {
        zip.file(fileName, JSON.stringify(fileData, null, 2));
    }
}

const downloadScenario = async (scenario, userId, setLoading, dispatch) => {
    const {id, city, label} = scenario;
    setLoading(true);

    const scenarioDataUrl = `${DATA_URL}/scenarios/${id}/user_changes/data`
    const baseRoadsDataUrl = `${DATA_URL}/scenarios/${city}/base_roads/data`
    const baseRoadsConfigUrl = `${DATA_URL}/scenarios/${city}/base_roads/config`
    const baseGridDataUrl = `${DATA_URL}/scenarios/${city}/base_grid/data`
    const baseGridConfigUrl = `${DATA_URL}/scenarios/${city}/base_grid/config`

    Promise.all([
        loadRemoteData(scenarioDataUrl, userId),
        loadRemoteData(baseRoadsDataUrl, userId),
        loadRemoteConfig(baseRoadsConfigUrl, userId),
        loadRemoteData(baseGridDataUrl, userId),
        loadRemoteConfig(baseGridConfigUrl, userId)
    ]).then(
        async ([scenarioData, baseRoadsData, baseRoadsConfig, baseGridData, baseGridConfig]) => {
            const zip = new JSZip();
            addToZip(zip, "scenarioData.geojson", scenarioData)
            addToZip(zip, "baseRoadsData.geojson", baseRoadsData)
            addToZip(zip, "baseRoadsConfig.json", baseRoadsConfig)
            addToZip(zip, "baseGridData.geojson", baseGridData)
            addToZip(zip, "baseGridConfig.json", baseGridConfig)

            zip.generateAsync({type: "blob"}).then((content) => {
                saveAs(content, `Scenario Input - ${label}.zip`);
                setLoading(false);
            }).catch(error => {
                console.error("Failed to create zip:", error);
                setLoading(false);
            });
        },
        error => {
            if (error) {
                const {message} = error;
                dispatch(
                    loadRemoteResourceError(`${message} - ${LOADING_SAMPLE_ERROR_MESSAGE} ${id} (${scenarioDataUrl})`, scenarioDataUrl)
                );
                setLoading(false);
            }
        }
    );
};

export const DownloadScenarioButton = ({item, userId}) => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    return (
        <button
            className={"empty-table empty-table-button"}
            onClick={(e) => {
                e.stopPropagation(); // Prevent triggering row click event
                downloadScenario(item, userId, setLoading, dispatch);
            }}
            title="Download scenario as JSON"
        >
            {loading ? <FaSpinner className="spinner"/> : <><FaDownload/><span>&nbsp;Download</span></>}
        </button>
    );
};