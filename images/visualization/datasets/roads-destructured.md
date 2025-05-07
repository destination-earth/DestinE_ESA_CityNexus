# Roads Geo JSON

The following shows one line of the roads_*.json file.

```json
{
    "type": "Feature",
    "properties": {
        "objectid": "120019090520220401131659308",
        "id_lokalid": "1200190905",
        "id_namespa": "http://data.gov.dk/geodanmark",
        "tempid": null,
        "g_status": "Endelig",
        "virk_fra": "2017-02-08T17:58:14.000000+01:00",
        "virk_til": null,
        "virk_akt": "Hvidovre kommune",
        "reg_fra": "2022-04-01T13:16:59.308000+02:00",
        "reg_til": null,
        "reg_akt": "167",
        "f_omr": "1",
        "f_haendels": "Ændret attribut",
        "f_proces": null,
        "status": "Anlagt",             // Status           = Created
        "reg_spec": "GeoDanmark Spec 6.0",
        "dataansvar": "Ikke tildelt",
        "p_noej": "0.10",
        "v_noej": "0.30",
        "p_smetode": "Fotogrammetri",
        "v_smetode": "Fotogrammetri",
        "kommentar": null,
        "app": "GeoDanmark Klient",
        "vejmidtety": "Vej",
        "vejmyndigh": "Ikke tildelt",   // Way authority    = Not assigned
        "cvfadmnr": "0",            
        "kommunekod": "0167",           // Community code   = 0167
        "vejkode": null,                // Way code         = null
        "vejkategor": "Anden vej",      // Way category     = Anden vej (Other way)
                                        //                    Hovedrute (Main Route)
                                        //                    Lille vej (Small road)
                                        //                    Cykelbane langs vej (Cycle path along the road)
                                        //                    Fiktiv (Fictional)
                                        //                    Mindre sti (Smaller path)
        "trafikart": "Al færdsel",      // Type of traffic  = Al færdsel (All traffic)
                                        //                    Motorvej (Motorway)
                                        //                    Cykelsti (Bicycle path)
                                        //                    Sti (Path)
                                        //                    Gangsti (Walkway)
        "niveau": null,
        "overflade": "Befæstet",        // Surface          = Fortified
        "tilogfrako": "0",
        "rundkoerse": "0",
        "gmlid": "gdk60.1200190905"
    },
    "geometry": {
        "type": "LineString",
        "coordinates": [
            [ 12.479577202266491, 55.614464447210509, 1.19 ],
            [ 12.479571940381151, 55.614437352346428, 1.13 ],
            [ 12.479505368847239, 55.614141623696035, 0.64 ],
            [ 12.479499021077528, 55.614113031110023, 0.6 ],
            [ 12.479492784640897, 55.614085694174577, 0.57 ],
            [ 12.479484643777749, 55.614049419804829, 0.63 ]
        ]
    }
}
```