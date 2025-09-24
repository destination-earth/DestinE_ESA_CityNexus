| ![](media/4b6438a00e58aeae5c8736693606a46d.emf) |  ![](media/c2c66212059f3f77d379df9204ed55a0.png) |
|-------------------------------------------------|--------------------------------------------------|

![](media/b330f3488abf3708bcafa19936a31653.png)

![](media/c3fc78f94d29dea2d88d0adfc71b081a.png)CITYNEXUS

Use Case Descriptor

Solenix Engineering GmbH

Project Ref.: SLXENGDE/CITYNEXUS/2023

Doc. Ref.: SLXENGDE-CITYNEXUS-D5.2

| Title:                | CITYNEXUS                                                                                                                                                                                                                                                                                                              |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Volume:               | Use Case Descriptor                                                                                                                                                                                                                                                                                                    |
| Customer:             | Starion Italia S.p.A                                                                                                                                                                                                                                                                                                   |
| Customer Reference:   | CS301353.Docref.0001                                                                                                                                                                                                                                                                                                   |
| Project Reference:    | SLXENGDE/CITYNEXUS/2023                                                                                                                                                                                                                                                                                                |
| Document Reference:   | SLXENGDE-CITYNEXUS-D5.2                                                                                                                                                                                                                                                                                                |
| Date:                 | 02/07/2025                                                                                                                                                                                                                                                                                                             |
| Version:              | 06.01                                                                                                                                                                                                                                                                                                                  |
| Document Responsible: | Simone Fratini                                                                                                                                                                                                                                                                                                         |
| Author(s):            | Consortium Team                                                                                                                                                                                                                                                                                                        |
| Approved:             | Technical Officer                                                                                                                                                                                                                                                                                                      |
| Company:              | Solenix Engineering GmbH Phone: +49 6151 870 91 0 Spreestrasse 3 E-Mail: info@solenix.de 64295 Darmstadt Internet: www.solenix.de Germany                                                                                                                                                                              |
|                       | The copyright of this document is vested in the European Space Agency. This document may only be reproduced in whole or in part, stored in a retrieval system, transmitted in any form, or by any means, e.g. electronically, mechanically or by photocopying, or otherwise, with the prior permission of the Agency.  |

**  
**

**Document Log**

| Revision | Date       | Responsible    | Comment                                                                                                         |
|----------|------------|----------------|-----------------------------------------------------------------------------------------------------------------|
| 01.00    | 27/11/2023 | Simone Fratini | Document Creation                                                                                               |
| 02.00    | 15/02/2024 | Simone Fratini | Document Update for RR1. Section 3 added.                                                                       |
| 02.01    | 07/03/2024 | Simone Fratini | Document Update after RR1. Sections 4.2, 4.3 and 5 updated. Section 5 - “User Manual” added.                    |
| 03.00    | 21/05/2024 | Simone Fratini | Document update for RR2. Section 4 updated and merged with Section 5. New Section added “CITYNEXUS Application” |
| 04.00    | 16/09/2024 | Simone Fratini | Document update for RR3. Section 5 updated.                                                                     |
| 04.01    | 30/09/2024 | Simone Fratini | RIDs resolution, references fixed.                                                                              |
| 05.00    | 03/12/2024 | Simone Fratini | Document update for CCN1-MS1. Sections 3,4 & 5 Updated                                                          |
| 05.01    | 19/12/2024 | Simone Fratini | RIDs resolution. Section 5 removed.                                                                             |
| 06.00    | 22/05/2025 | Simone Fratini | Document update for FR. Formatting and minor editing.                                                           |
| 06.01    | 02/07/2025 | Simone Fratini | Update for Final Delivery. Minor editing.                                                                       |

Distribution List

| Name                 | Organisation          |
|----------------------|-----------------------|
| Technical Officer    | Starion Italia S.p.a. |
| CITYNEXUS Consortium | Solenix, MindEarth    |

Table of Content

[Distribution List](#_Toc202790166)

[1 Scope and Purpose](#_Toc202790167)

[1.1 Document Structure](#_Toc202790168)

[2 Applicable and reference documents](#_Toc202790169)

[2.1 Applicable Documents](#applicable-documents)

[2.2 Reference Documents](#_Toc202790171)

[2.3 Acronyms and Abbreviations](#acronyms-and-abbreviations)

[3 CityNexus Platform Overview](#citynexus-platform-overview)

[4 Use Case Overview](#_Toc202790174)

[4.1 Use Case Extension](#use-case-extension)

[4.1.1 Bologna](#bologna)

[4.1.2 Seville, Spain](#seville-spain)

[4.1.3 Aarhus, Denmark](#aarhus-denmark)

[4.2 Project workflow](#project-workflow)

[4.3 User Community](#user-community)

[4.4 Scale](#scale)

[4.5 Policy and indicators](#policy-and-indicators)

[4.6 “What-if” scenarios](#what-if-scenarios)

[4.7 DestinE Data Portfolio Data](#destine-data-portfolio-data)

[4.8 Publicly available data](#publicly-available-data)

[4.9 Commercial Data](#commercial-data)

[4.10 Data Summary](#_Toc202790187)

# Scope and Purpose

This document is the deliverable D5.2 – Use Case Descriptor for the CITYNEXUS project.

## Document Structure

-   Platform Overview
-   Use Case Overview
-   Data and Access Plan

# Applicable and reference documents

## Applicable Documents

| Ref.     | Document Title                                          | Reference/Link                                                                                              |
|----------|---------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| ITT      | Invitation to Tender                                    | CS301353.Docref.0001, 18/04/2023                                                                            |
| STC      | Special Conditions of Tender                            | Appendix 3 to RHEA CS301353.Docref.0001, 18/04/2023                                                         |
| SOW      | Statement of Work                                       | CS301353.Docref.0002, 18/04/2023                                                                            |
| ITT      | Invitation to Tender                                    | CS301353.Docref.0001, 18/04/2023                                                                            |
| PROP-TP  | Technical Proposal                                      | SLXENGDE-CITYNEXUS-PRP-02-TP                                                                                |
| PROP-MIP | Managerial and Implementation Proposal                  | SLXENGDE-CITYNEXUS-PRP-03-MIP                                                                               |
| AD-02    | Scrum as Agile project management                       | <https://www.scrum.org/>                                                                                    |
| AD-03    | Agile Software Development Handbook, Issue 1 April 2020 | [ECSS-E-HB-40-01A](https://ecss.nl/home/ecss-e-hb-40-01a-agile-software-development-handbook-7-april-2020/) |

## Reference Documents

| Ref.   | Document Title                                               | Reference/Link           |
|--------|--------------------------------------------------------------|--------------------------|
| RD-01  | CITYNEXUS - Project Management Plan for Use Case Application | SLXENGDE-CITYNEXUS-D5.1  |
| RD-02  | CITYNEXUS - Software Release Plan                            | SLXENGDE-CITYNEXUS-SRP   |
| RD-03  | CITYNEXUS - Software Requirement Specification               | SLXENGDE-CITYNEXUS-SRS   |
| RD-04  | CITYNEXUS - Software Verification & Validation Plan          | SLXENGDE-CITYNEXUS-SVVP  |
| RD-05  | CITYNEXUS - Use Case Promotion Package                       | SLXENGDE-CITYNEXUS-D5.5  |

## Acronyms and Abbreviations

| Acronym  | Description                                                             |
|----------|-------------------------------------------------------------------------|
| AI       | Artificial Intelligence                                                 |
| ESA      | European Space Agency                                                   |
| ESOC     | European Space Operations Centre                                        |
| EUMETSAT | European Organisation for the Exploitation of Meteorological Satellites |
| ITT      | Invitation to Tender                                                    |
| KOM      | Kick-off Meeting                                                        |
| KPI      | Key Performance Indicator                                               |
| ML       | Machine Learning                                                        |
| SOW      | Statement of Work                                                       |
| SW       | Software                                                                |
| TO       | Technical Officer                                                       |
| WBS      | Work Breakdown Structure                                                |
| WP       | Work Package                                                            |
| XAI      | Explainable AI                                                          |

# CityNexus Platform Overview

CityNexus is an innovative **urban digital twin application designed to assess the environmental, social, and economic impacts of changes in road networks, mobility, and urban space design.** The platform is designed to respond to the needs of the **Local Council of Amager Vest,** a district of the city of Copenhagen, primary end-user of the project, providing policymakers a **collaborative platform to experiment with various strategies and solutions**, considering diverse factors and variables crucial for successful and sustainable urban interventions, thereby **facilitating a coordinated approach to decision-making**. The platform has been extended to include Bologna (Italy), Seville (Spain), and Aarhus (Denmark), demonstrating its adaptability and scalability across diverse urban contexts.

The CityNexus platform aims to facilitate **evidence-based decision-making at the municipality level** by providing capabilities to **evaluate a comprehensive set of Key Performance Indicators** (KPIs) and by implementing an **interactive system for assessing the impact of infrastructural and mobility changes** on the target KPIs through policy-relevant, user-defined 'what-if' scenario simulations.

The key thematic areas addressed are:

-   **Mobility Patterns**: CityNexus provides detailed insights into commuting patterns, travel behavior, traffic flows, congestion rates, peak traffic hours, and overall mobility dynamics in the city. This information is crucial for understanding and addressing the challenges of urban transport and traffic management.
-   **Air Quality**: The platform evaluates the concentration of various pollutants at ground level, like nitrogen dioxide (NO2), sulfur dioxide (SO2), carbon monoxide (CO), ozone (O3), black carbon particles, and ultrafine particles.
-   **Dynamic Population Distribution**: CityNexus enables users to manipulate the number of people residing in different parts of a city, providing insights into how changes in residential distribution impact population movements and densities across various urban areas.
-   **Service and POI Distribution**: CityNexus empowers users to adjust the number, type, and spatial distribution of various land use classes and points of interest within the city. By simulating changes in the availability and diversity of services, the platform provides detailed insights into how these modifications affect travel patterns, enabling users to evaluate the mobility impacts of introducing or reconfiguring urban services.

CityNexus offers functionalities for generating **"what if" simulations** based on four transformation scenarios, aligned with the development options being considered by the Municipality. These scenarios include **high-speed road redesign, promoting electric and low-emission vehicles, creating Low Emission Zones, and adjusting road speed limits**. Each scenario aims to contribute to a more sustainable, healthy, and liveable urban environment in Copenhagen.

CityNexus employs the Kubernetes Infrastructure as well as Data Workflow of the **Destination Earth (DestinE)** to deploy the application and provide access to the users.. Trough the platform, **users can assess the effects of different interventions on targeted KPIs and explore their compound effects in a risk-free virtual environment before real-world implementation.**

![A split screen of a city Description automatically generated](media/50ed6aeaadc8e03a05f019062fcded9a.png)The implementation of CityNexus and its "what-if" scenario capabilities is expected to have a profound and multi-faceted impact on users, particularly in terms of urban planning, environmental sustainability, transportation, and public health policies. In the short term, users, including urban planners, policymakers, and the public, will gain **a powerful tool for visualizing and understanding the potential impacts of various urban development decisions**. This interactive and participatory approach to planning will allow for more informed and community-driven decisions. By simulating different scenarios, CityNexus provides insights into how changes in infrastructure, such as transforming high-speed thoroughfares or promoting electric vehicles, can influence human mobility, air quality, and public health. This ability to evaluate the potential outcomes of various initiatives before implementation will be instrumental in guiding effective policy decisions and urban development strategies.

In the long-term, CityNexus is expected to significantly contribute to Copenhagen's journey towards a more sustainable, healthy, and smart urban future, aligning with the city's ambitious environmental and urban quality of life goals. By integrating with key policies like the Copenhagen Climate Plan and the Copenhagen Bicycle Strategy, the platform supports the city’s endeavours to become carbon-neutral by 2025 and evolve into a premier global city for cycling.

![A group of people around a table looking at a map Description automatically generated](media/967a9903e897d481403ab86b7b2c48f4.png)Moreover, the impact of CityNexus extends beyond regional boundaries. There is a concerted effort to connect with cities participating in the EU’s 100 Climate-Neutral and Smart Cities by 2030 initiative. In particular, the cities of Bologna, Seville, and Aarhus, all part of the program, shall be included into the platform, demonstrating the scalability and adaptability of the application across diverse urban contexts, each facing unique challenges in mobility, air quality, and urban sustainability. This expanded network of participating cities positions CityNexus as a pioneering model for leveraging digital twin technology in urban planning and policymaking for collaborative, data-driven strategies.

# Use Case Overview

With growing concerns for environmental sustainability and urban quality of life, cities worldwide are striving to reduce traffic congestion and promote sustainable transportation. To this purpose, the City of Copenhagen - renowned for its commitment to sustainability - is exploring strategies to reimagine existing car-centric road infrastructure through transformative initiatives. Here, one of the potential interventions involves the covering of major high-speed thoroughfares and the requalification of the corresponding areas to improve air quality and quality of life in response to pressing demands of citizens and local councils.

In particular, the City of Copenhagen is currently in the process of discussing plans for addressing traffic congestion in Ørestad, a mixed-use area in the Amager Vest district[^1], due to the presence of a high-speed road cutting through the heart of this neighborhood comprising residential, commercial, and university buildings. The municipality, animated by local councils and civil society organizations, plans to transform this main thoroughfare to better manage traffic, improve air quality, and enhance living standards. Central to this initiative is understanding the impact of different hypotheses of transformation, going beyond simple budget considerations, but also addressing broader aspects of human mobility, service accessibility, air quality, and public environmental health. The city has a strong interest in exploring innovative tools for interactive assessment of different spatial planning and urban development options and for evaluating tradeoffs of climate adaptation policies and regulatory changes, hence supporting data-driven decision-making in urban planning.

[^1]: Amager Vest is one of the ten administrative districts of Copenhagen Municipality, Denmark.

To respond to the needs of the **Local Council of Amager Vest,** primary end-user of the project, here represented by **UrbanDigital**, and the wider **City of Copenhagen**, **CITYNEXUS** is an **innovative urban digital twin application** designed to **assess the environmental, social, and economic impacts of changes in road networks, mobility**, and **urban space design**. Leveraging the **DestinE** system, CITYNEXUS aims to evaluate baseline conditions for human mobility, including key indicators like **air quality, population distribution, public health**, and **service accessibility** and integrates live **what-if scenario** capabilities.

Furthermore, while designed to respond do very specific and real-world needs of the end-user and the local user communities of the Copenhagen Greater Metropolitan Area, CITYNEXUS will showcase its **usefulness** and **transferability** to any city located in Denmark (refer to “*Scale”* section).

As primary outputs, CITYNEXUS aims at generating:

-   A comprehensive evaluation of baseline conditions for human mobility and additional key performance indicators (KPIs), including air quality, population distribution, public health, and service accessibility.
-   An interactive system for assessing the impact of infrastructural and mobility changes on the target KPIs through policy-relevant user-defined 'what-if' scenario simulations.

To achieve these aims, CITYNEXUS integrates a wide range of data, including dynamic human mobility information from third-party commercial providers, authoritative data from governmental and para-governmental agencies, open repositories, as well as layers from the DestinE Data Portfolio. These inputs offer valuable insights into mobility and traffic patterns, transport infrastructure, air pollution, urban services and facilities, and socio-demographic indicators (refer to “*Data, metadata models need and access plan”* section).

In this framework, the DestinE system shall provide a unified hub for accessing and navigating project-generated data, performing on-demand simulations, as well as sharing and disseminating results.

By evaluating the effects of transformation scenarios on mobility, air quality, population health, and other KPIs, CITYNEXUS is expected to offer tangible benefits to local municipalities, making it a valuable tool for data-driven urban planning and nurturing a broad user community focused on sustainable urban solutions (refer to “User Community” section for more details).

## Use Case Extension

The CITYNEXUS project demonstrates its adaptability and scalability by incorporating three additional cities: **Bologna (Italy), Seville (Spain), and Aarhus (Denmark)**. These cities were selected for their alignment with the project's focus on sustainable mobility, air quality improvement, and urban innovation. Each city’s participation in the **EU Mission for 100 Climate-Neutral and Smart Cities by 2030**[^2] underscores their shared commitment to climate adaptation and sustainable urban development. Their inclusion emphasizes the transferability of CITYNEXUS’s analytical tools across diverse urban contexts. Below, each city is presented within the broader scope of CITYNEXUS, highlighting its relevance and contributions to the project’s objectives.

[^2]: https://netzerocities.eu/2022/04/28/the-european-commission-announces-the-100-selected-cities-to-join-the-cities-mission

### Bologna

Bologna, a prominent urban center in northern Italy, is home to approximately 400,000 residents within the city and over 1 million in its metropolitan area. Known for its rich cultural heritage and academic prominence as the site of the world’s oldest university, Bologna serves as a hub for education, technology, healthcare, and transportation. Strategically located at the crossroads of major highways and rail networks, Bologna plays a pivotal role in Italy’s transportation system, facilitating significant passenger and freight movement. Its economic diversity includes a strong industrial base, vibrant tourism, and leading institutions like Sant’Orsola-Malpighi Polyclinic and Maggiore Hospital, which contribute to its role as a critical healthcare hub.

Bologna faces mobility challenges due to its dense historical urban layout and a dynamic population influx of students, researchers, and professionals. The **Sustainable Urban Mobility Plan (SUMP)**[^3] targets a 40% reduction in traffic-related greenhouse gas emissions by 2030. Central to this effort are investments in cycling infrastructure, pedestrian zones, and the decarbonization of public transport, including the expansion of tram systems and the Metropolitan Railway System (SFM). Another significant initiative is the **Bologna Città 30[^4]**, implemented in 2023, which enforces a 30 km/h speed limit in residential areas to enhance safety and reduce emissions. While these measures have shown promise, challenges such as increased congestion on arterial roads and inconclusive air quality improvements highlight the need for robust evaluation tools. CITYNEXUS can assist Bologna by integrating mobility and environmental data to refine these initiatives and optimize their impact on urban liveability and sustainability.

[^3]: https://pumsbologna.it/Engine/RAServeFile.php/f/allegati/EN-DOC-SINTESI-PUMSBO.pdf

[^4]: https://www.bolognacitta30.it/

### Seville, Spain

Seville, the capital of Andalusia, is a dynamic city with a population of approximately 700,000 in the city proper and 1.5 million in the metropolitan area. Renowned for its historic architecture, vibrant cultural traditions, and economic significance, Seville serves as a major hub for tourism, logistics, and regional administration. However, its historic layout of narrow streets and dense neighbourhoods presents unique challenges for modern urban mobility, compounded by a significant seasonal influx of tourists.

Seville has been a pioneer in promoting sustainable mobility and improving air quality. Its **Low Emission Zone (ZBE)**[^5], established in compliance with national regulations, restricts high-emission vehicles in key areas to reduce pollution and enhance public health. In addition, the city has invested heavily in cycling infrastructure, implementing the **2007 Bike Masterplan**[^6], which established a 120 km network of segregated cycle paths. This initiative increased cycling’s modal share to nearly 6% of total urban mobility and serves as a benchmark for other cities aiming to promote active mobility. Seville has also launched air quality measurement campaigns within its metro system, demonstrating its commitment to healthier urban environments. CITYNEXUS can complement these efforts by providing advanced analytical tools to assess and optimize the effects of these policies, ensuring data-driven decision-making for sustainable mobility planning.

[^5]: https://www.andalucia.com/cities/seville/low-emission-zone

[^6]: https://ediaqi.eu/articles/launching-air-quality-measurement-campaigns-metro-sevilla

### Aarhus, Denmark

Aarhus, Denmark’s second-largest city, combines historic charm with modern innovation. With a population of around 350,000 in the city and 1.4 million in the Central Denmark Region, Aarhus is a key centre for education, healthcare, and technology. Its position as Denmark’s largest container port and its integrated public transport system, which includes buses, light rail, and cycling infrastructure, reinforce its role as a vital transportation hub. However, rapid population growth, driven by internal migration and international students, places pressure on housing and transportation systems, with suburban sprawl increasing car dependency.

Aarhus is a leader in sustainability, evidenced by its **Aarhus Climate Action Plan 2021-2024[^7]**, which targets carbon neutrality by 2030. This plan includes the decarbonization of public transport, the expansion of cycling infrastructure, and measures to address suburban sprawl through smart city solutions. The city’s **Green Mobility Plan (2024)** builds on these goals by promoting active mobility and public transport as alternatives to car use, ensuring alignment with climate objectives. Aarhus’s innovative approach to sustainable mobility is further exemplified by the **Smart Mobility Project**[^8] **(2014-2017)**, which tested 22 pilot initiatives to influence commuting behaviours, reduce car dependency, and improve air quality. Complementing these efforts, the city participates in a national **Air Quality Monitoring Program[^9]**, managed by the Danish Centre for Environment and Energy (DCE) at Aarhus University. This program integrates a network of monitoring stations and atmospheric dispersion models to provide comprehensive data on pollutants such as nitrogen oxides, particulate matter, and carbon monoxide. CITYNEXUS can leverage this data to simulate and analyse the impacts of Aarhus’s policies, supporting evidence-based strategies for improving mobility and air quality.

[^7]: https://aarhus.dk/media/twoe5i23/climate-action-plan.pdf

[^8]: https://urban-mobility-observatory.transport.ec.europa.eu/resources/case-studies/aarhus-encourages-residents-trial-alternative-means-commuting_en

[^9]: https://envs.au.dk/en/research-areas/air-pollution-emissions-and-effects/the-monitoring-program

## Project workflow

The proposed workflow encompasses **7 different phases**, namely:

-   Co-defining a range of relevant mobility, environmental, and socio-economic KPIs with the end-users,
-   Gathering and harmonizing relevant mobility and KPI data over a given targeted period of interest,
-   Developing a robust empirical model relating the different KPIs to mobility,
-   Defining, in collaboration with the end users, realistic scenarios for potential changes in road network, mobility and urban fabric,
-   Developing a robust empirical model simulating the effects of interventions for each scenario on the identified KPIs,
-   Visualizing and interpreting the scenario results through a dedicated dashboard,
-   Generating comparisons and recommendations from each scenario to highlight trade-offs and synergies.

## User Community

The user community engaged by the CityNexus consortium consists of **local authorities**, **non-governmental organizations**, and **private businesses** actively involved in promoting sustainability transitions, particularly in the areas of mobility, air pollution, and urban development.

To build and nurture a thriving user community around the CityNexus initiative, the Consortium devised an engagement strategy that includes various communication channels and targeted outreach efforts.

Within Copenhagen, local districts and nearby municipalities facing similar challenges related to motorway transformations, mobility infrastructure projects, and noise mitigation will be engaged. Therefore, in addition to the already mentioned **Local Council of Amager Vest**, key stakeholders shall include the **Local Councils of Bispebjerg** and **Valby** and the **municipality of Gentofte**. These additional stakeholders will be primarily involved in the knowledge transfer events held in Copenhagen together with members of the wider local community to participate and provide feedback (see “Stakeholder Engagement” Section in [RD-05]). Furthermore, to expand CityNexus’s visibility and impact, whenever possible consortium representatives will virtually participate in local events, such as the **periodic meetings of the 12 official Local Councils in Copenhagen** (held 4 times a year), where the progress of the CITYNEXUS project will be presented.

To expand the user community associated with CityNexus a broader range of stakeholders at both regional, national, and international levels will be engaged. This implies, first and foremost, establishing a strong link with the Copenhagen Municipality, renowned for its pivotal role in driving sustainable initiatives and policies in the region and holding a prominent role model in driving sustainable urban development for other Danish and European cities. To maintain a close interaction with Copenhagen Municipality, representatives of the consortium will seek the opportunity to participate in relevant events, conferences, and forums focusing on sustainable urban development attended by the municipality. For example, it is envisaged that in June-July 2024, an event on Climate Awareness will be held in Copenhagen, attended by representatives of the Municipality and other entities and civil society organizations. By showcasing the CityNexus initiative and presenting a progress update on the work completed to date, this event will provide the opportunity to engage with municipality representatives, exchange ideas, and foster collaborations.

Expanding beyond Copenhagen, the consortium will leverage the prominent role of Copenhagen as a participant in the EU’s Mission “100 Climate-Neutral and Smart Cities by 2030.” In addition to Copenhagen, the cities of Seville, Bologna, and Aarhus—also members of this mission—will be included in the CityNexus project, expanding the geographical scope and impact of the initiative. It is also expected that other Danish cities, such as Sønderborg, already represented within the mission, might also show interest in participating. Outreach and dissemination activities will further capitalize on this extensive network as well as on Copenhagen’s membership in other influential high-impact networks such as ICLEI-EUROPE network3, the EUROCITIES network4, the CCRE – CEMR network5 and, at a global level, the Global Covenant of Mayors6 and the C40 Cities network7. To this end, towards the end of the project, dedicated outreach meetings and live demonstrations will be held.

To facilitate and support these wider engagement efforts, the end user (LCAV/UrbanDigital) plays a pivotal role, leveraging its strong connections with local councils and municipalities in Denmark and abroad, as well as a wide range of national and international businesses. By adopting a multi-level collaborative approach and actively engaging with various stakeholders at local, national, and European levels, we aim to build a strong and diverse user community. This will not only benefit immediate stakeholders but also contribute to the broader application and impact of the CityNexus platform, establishing a network of cities committed to sustainable urban development. Key stakeholders have been identified to ensure comprehensive engagement and success. Tier-One stakeholders include entities responsible for or directly related to the potential covering of the motorway: Vejdirektoratet, which oversees Denmark's state-owned roads, managing over 3,700 km; Sund & Bælt, a state-owned company with the overall responsibility of operating and maintaining Denmark's major fixed links; and CPH By&Havn, one of Denmark’s largest urban development corporations, owned by the City of Copenhagen and the State. Additionally, Tier-Two stakeholders comprise representatives from the 12 nearby municipalities with existing challenges related to traffic and air quality, who have formed a petition group to lobby at the national level. These include Høje Taastrup, focusing on reducing air pollution from motorway traffic; Vallensbæk, tackling noise pollution from major motorways with significant noise barriers; Rødovre, dealing with air pollution issues from the E47 motorway; Gladsaxe, actively engaging in climate adaptation and urban mobility projects; and Tårnby, planning to expand the airport and improve road infrastructure to manage traffic and air quality issues. Engaging these stakeholders will address the specific challenges faced by each municipality, leveraging their unique insights and experiences to enhance the CityNexus platform. This collaboration will ensure that the platform is effective in its immediate applications and adaptable and beneficial for a wide array of urban environments.

## Scale

##### Spatial Scale

To support evidence-based decision making at the municipality level, CITYNEXUS operates at the **local scale**, with a core focus on the Copenhagen Greater Metropolitan Area, for which a remarkable set of reference data are available for several indicators. This includes the 10 districts forming the city of Copenhagen (of which Amager Vest is part) and its surrounding municipalities, accommodating \~1.3 million people with diverse economic activities and extensive transportation networks. Depending on their nature, different KPIs of interest will be targeted at specific aggregation units, ranging from individual road segments to 100x100m cells or census areas. Once completed, to assess its transferability, CITYNEXUS shall be made operational for a larger region of interest comprising the entire Denmark.

##### Temporal scale

To characterize the seasonal patterns of human mobility and, in turn, their relationships to the targeted KPIs, CITYNEXUS is intended to operate on a **quarterly temporal scale** and to differentiate the analyses between **typical weekdays and weekends**. On the one hand, this will allow deriving statistically robust baseline conditions when characterizing the reference patterns for the human mobility and the different KPIs. On the other hand, this shall enable a more realistic and nuanced understanding of the effects of *“what-if”* mobility and infrastructural changes at different times of the year.

## Policy and indicators

By integrating with key policies like the Copenhagen Climate Plan and the Copenhagen Bicycle Strategy, CityNexus wants to make a significant contribution to Copenhagen’s journey towards a more sustainable, healthy, and smart urban future, aligning with the city’s ambitious environmental and urban quality of life goals and addressing existing constraints and limitations.

Indeed, currently, strategic decisions related to mobility and infrastructural interventions are primarily driven by economic constraints, thus overlooking the complex and multifaceted impacts on neighbourhoods and local communities. This issue is further exacerbated by a limited coordination and communication between districts of the same city or neighbouring municipalities, hence making it challenging to assess the holistic impact of a specific intervention on nearby areas.

To address these limitations, CITYNEXUS offers policymakers a collaborative environment where they can freely experiment with different strategies and solutions. It provides a comprehensive decision-making framework that goes beyond simplistic cost considerations and considers the specific needs expressed by the user community (reflected in the selected KPIs). In this regard, CITYNEXUS targets a set of KPIs (preliminary identified together with the end users) addressing different thematic areas, namely:

1.  **Mobility patterns:** providing insights into commuting patterns, travel behavior, traffic flows, congestion rates, peak traffic hours, and overall mobility dynamics by means of the open-source Mobilkit library [RD-6] for analysing human mobility data;
2.  **Air quality:** evaluating concentration of various pollutants at ground level [e.g., nitrogen dioxide (NO2), sulfur dioxide (SO2), carbon monoxide (CO), ozone (O3), black carbon particles, ultra-fine particles] derived either by exploiting data gathered from mobile mapping campaigns and in-situ stations (provided by the end users), as well as by downscaling Sentinel-5P data to 100m spatial resolution by means of a cutting-edge approach leveraging recent advances in artificial intelligence [RD-7];
3.  **Dynamic population distribution**: describing the patterns of human presence over time at fine spatial and temporal resolution.
4.  **Service and POI Distribution:** evaluate the changes in number and density of key urban services (such as transportation, healthcare, education, workplaces, commercial and recreational facilities) and other types of points of interest affect travel patterns.

    During the early stages of the project, the specific KPIs for each thematic area will be co-defined in collaboration with the reference user community (see “Stakeholder Engagement” Section in [RD-05] for a process and status detailed description), thus enabling a better adaptation of the existing systems and processes in place.

## “What-if” scenarios

CITYNEXUS offers dedicated functionalities for performing "what if" simulations (specifically designed originally based on actual needs of the Local Council of Amager Vest and the City of Copenhagen and later extended considering the needs of the new cities, Aarus, Seville and Bologna), where users are given the possibility to assess the effects of different types of interventions on the mobility patterns and all other targeted KPIs. Four original scenarios have been identified:

1.  **"High-speed Road Redesign":** this scenario reflects ongoing discussions in the Local Council of Amager Vest and the City of Copenhagen regarding the potential transformation of high-speed road segments into tunnels and reclaiming the corresponding space for residential areas, green spaces, or recreational/leisure amenities. Accordingly, CITYNEXUS will allow simulating the tunneling of any existing road segment, while repurposing the reclaimed space above ground for other urban uses;
2.  **"Electric, Low-Emission Vehicles, and Active Mobility Promotion":** this scenario responds to the City of Copenhagen's efforts to promote the adoption of electric and low-emission vehicles as well as of active mobility options as part of its sustainable transportation initiatives and climate-neutrality ambitions. To this purpose, CITYNEXUS will enable users to customize the proportion of these vehicles and modes within the overall traffic fleet.
3.  **"Low Emission Zones Creation":** this scenario aligns with the City of Copenhagen's exploration of implementing low emission zones (LEZ). In this regard, CITYNEXUS will allow users to convert specific census units, neighborhoods or manually defined areas to LEZ, where motorized circulation is prohibited or limited to specific classes of vehicles.
4.  **"Road Speed Adjustment":** this scenario reflects the impact of high traffic speed on air quality and environmental pollution. Accordingly, CITYNEXUS shall enable adjustments to speed limits for specific road segments or entire categories of roads.

In addition to that, two new scenarios have been identified:

5.  "**Greener Streets**”: this scenario supports the effort of the city of Bologna in targeting a 40% reduction in traffic-related greenhouse gas emissions by 2030. CITYNEXUS will enable the simulation of the effects of increased % of bicycles in the traffic fleet, conversion of streets into pedestrian zones and street speed reduction, to enforces a 30 km/h speed limit in residential areas to enhance safety and reduce emissions.
6.  “**Eco-mobility Campaign**”: this scenario combines the Low Emission Zone Creation scenario with the Active Mobility Promotion scenario to support the efforts of the city of Seville in increasing cycling’s modal share to nearly 6% of total urban mobility while contextually restricting high-emission vehicles in key areas to reduce pollution and enhance public health.

Through these scenario simulations, users can assess the potential impacts of their proposed changes on the co-defined KPIs within a risk-free virtual environment before implementing them in the real world. Moreover, by allowing the integration of multiple scenarios into the same simulation, CITYNEXUS enables a coordinated approach to evaluating the possible effects of strategic decisions not only on the immediate area but also on neighbouring districts indirectly influenced by the proposed changes.

In CITYNEXUS several datasets are envisaged to be employed which are either available from the DestinE Data Portfolio (DEDP), or accessible from publicly available repositories or commercial providers. In the following, a baseline list is provided for each of these categories.

## DestinE Data Portfolio Data

Some datasets are envisaged to be employed from the DestinE Data Portfolio (DEDP) datasets (summarized in Table 1 in Section 4.10):

-   **ECMWF' ERA5 Data:** ERA5 provides surface net solar radiation, planetary boundary layer height, total precipitation, and temperature at 2m above ground level, offering a spatial resolution of \~25 km (0.25°). This dataset is produced hourly and is generated by the European Centre for Medium-Range Weather Forecasts (ECMWF). It represents a reliable source of meteorological variables for environmental and climate studies, providing long-term historical records from July 1, 2019, to the present. Data will be used to model surface energy exchanges, precipitation patterns, and thermal dynamics (https://hda.data.destination-earth.eu/ui/dataset/EO.ECMWF.DAT.ERA5_LAND_HOURLY). (<https://hda.data.destination-earth.eu/ui/dataset/EO.ECMWF.DAT.ERA5_LAND_HOURLY>).
-   **Sentinel-5P TROPOMI:** This dataset offers Level-2 data on tropospheric NO₂, SO₂, and O₃ vertical column densities, as well as cloud fraction for NO₂, with a spatial resolution of 5.5 x 3.5 km. These data, available from July 1, 2019, to the present, allow for detailed mapping of air quality and pollutant dispersion patterns. Sentinel-5P is critical for understanding urban air quality, particularly for simulating the impacts of interventions in what-if scenarios (<https://hda.data.destination-earth.eu/ui/dataset/EO.ESA.DAT.SENTINEL-5P.TROPOMI.L2>).
-   **Copernicus DEM 30m:** The Copernicus Digital Elevation Model (DEM) provides a global elevation dataset with a resolution of 30 meters, delivering precise topographic details essential for slope analysis, hydrological modelling, and terrain impact studies on wind and water flow. This DEM integrates data derived from multiple sources, including satellite-based radar missions like TanDEM-X, ensuring consistency and high accuracy. It is widely used in environmental monitoring, urban planning, and infrastructure development, offering open access to support diverse scientific and practical applications.
-   **COPERNICUS CORINE Land Cover:** This dataset includes 44 land cover classes at a 100m resolution, providing detailed land use information across Europe. CORINE is essential for understanding land cover dynamics and emissions linked to different land use types (<https://hda.data.destination-earth.eu/ui/dataset/EO.CLMS.DAT.CORINE>)[^10].
-   The **Daily Global Forecast Layer** from the **DestinE Digital Twin for Weather-Induced Extremes** provides daily initialized four-day weather forecasts using the **IFS-NEMO model** at a spatial resolution of 4.4 km. This layer includes meteorological fields such as temperature, precipitation, wind speed (u/v components), surface pressure, and radiation. Data is structured on an octahedral reduced Gaussian grid and spans height levels (e.g., 100m), pressure levels (e.g., 1000-1 hPa), and surface fields (e.g., 2m temperature, 10m wind components) (https://hda.data.destination-earth.eu/ui/dataset/EO.ECMWF.DAT.DT_EXTREMES).

[^10]: There is ongoing evaluation to replace CORINE with Dynamic World Cover, which offers daily updates and higher temporal granularity

## Publicly available data

Different layers shall be used for training the machine-learning models discussed in the previous sections, which aim at simulating the effects of different interventions as part of the envisaged what-if scenarios. These are listed below, and summarized in Section 4.10 at the end of the document:

-   **NASA MERRA-2 Planetary Boundary Layer Height:** Layer derived from the NASA Modern-Era Retrospective analysis for Research and Applications, Version 2 (MERRA-2), with a spatial resolution of 70 km. It provides atmospheric data essential for understanding mixing layer dynamics and pollutant dispersion. Unlike ERA5's PBLH, the MERRA-2 dataset was chosen for its global coverage and robustness in capturing boundary layer variability10.
-   **Hydrography90m:** Layer that leverages the MERIT Hydro digital elevation model at a 3-arcsecond resolution (approximately 90m at the Equator) to derive a globally seamless, standardized hydrographic network. This network incorporates detailed stream topographic and topological information, making it one of the most accurate and high-resolution global hydrography datasets available. A key feature of the Hydrography90m network is its minimal upstream contributing area threshold of 0.05 km² (or 5 hectares), which enables the detailed extraction of headwater stream channels.
-   The **Global Wind Atlas (GWA)** provides high-resolution wind speed data at 250m, offering a globally consistent resource for detailed wind dynamics and energy potential assessments. Developed using mesoscale atmospheric modeling refined by microscale terrain corrections, the dataset captures average wind speeds at various heights (e.g., 10m, 50m, 100m) with high accuracy, accounting for local topography, surface roughness, and atmospheric stability. Freely accessible under an open license, GWA is ideal for wind energy site selection, urban planning, and environmental studies, surpassing broader datasets like ERA5 for applications requiring fine spatial resolution[^11].
-   **Global Human Settlement Layer (GHSL):** GHSL provides population density data, which is essential for analyzing human exposure to environmental risks and for modeling socio-economic dynamics. While WSF (World Settlement Footprint) would ideally replace GHSL, the lack of coverage for Germany and Poland necessitates the use of GHSL for these regions. This dataset remains static and time-independent but is periodically updated for broader applications.
-   **EEA AirBase – Poland and Germany:** The European Environment Agency (EEA) AirBase dataset provides air quality monitoring data from stations located across Europe, including Poland and Germany. This dataset includes measurements of key air pollutants such as PM2.5, PM10, NO2, and O3, along with metadata about station locations and types (e.g., urban, rural, traffic). The high-resolution and temporal granularity of the data make it suitable for analyzing air quality trends, validating models, and assessing the impact of local and regional emissions on ambient air quality. The dataset is openly accessible and supports environmental monitoring and policy-making efforts in compliance with EU Air Quality Directives.
-   **Near-ground air pollution levels (National network):** Hourly and daily average measurements of the levels of NO2, SO2, NOx, CO, O3, lead, PM10, PM2.5, benzene and specific heavy metals provided by the National Pollution Monitoring Programme (NAMP) of the Danish Environmental Protection Agency (EPA) in collaboration with the National Centre for Environment and Energy (NERI) [RD-19]. Measurements are taken from a network of 15 monitoring stations located in the Copenhagen area, Aarhus, Odense, and Aalborg, as well as several outer cities and rural locations. These stations measure the concentrations of different pollutants depending on their location and purpose. NAMP Data is licensed under Creative Commons Attribution 4.0 International License (CC BY 4.0) and made available with an update cycle of approximately two years after the collection year.
-   **Public transport schedule data:** General Transit Feed Specification (GTFS) data for public transport for different cities and countries is generally available via dedicated repositories such as the Mobility Database catalogs15 or TransitFeeds16, who give access to regularly updated detailed information on public transportation schedules, including timetables, delays, routes, and stations/stops. For Denmark, these databases contain details on 1758 routes and 38631 stops and cover a period between 2016 – 2021. To ensure that GTFS data for Denmark's public transport is up to date, this will be integrated with additional sources, including data from Rejseplanen A/S via their platform, Rejseplanen Labs17. All GTFS data is provided free of charge for non-commercial use, with attribution requirements.
-   **Copenhagen Air View (CAV) - Raw Survey Data:** This layer consists of point-based vector data, providing unfiltered raw readings from sensors measuring NO2, black carbon, and ultrafine particles. These sensors are mounted on Google Street View Cars and the data is collected during street-level campaigns in Copenhagen18. Each data point includes additional information such as temporal tag, specifically the date and time of collection, along with the speed of the camera at the time of acquisition, which provides a real-life indicator of average street speed. While this data layer is not accessible via open portals, it is made available by the end-user to the Consortium under an open license.
-   **Road Network:** Comprehensive data is sourced from OpenStreetMap (OSM) and the **Missing Roads dataset** curated by Facebook, which enhances OSM's coverage with additional road data for under-mapped areas. This dataset provides detailed and up-to-date information on building footprints, land use specifics, and road and transportation networks. It includes detailed mappings of driving and pedestrian networks, covering street dimensions, the number of lanes, and speed limits. The Missing Roads dataset, available through Facebook's Open Mapping initiative, contributes to improving road network accuracy in several countries. For a list of available countries included in this initiative, refer to the [Open Mapping at Facebook repository](https://github.com/facebookmicrosites/Open-Mapping-At-Facebook/wiki/Available-Countries).
-   **Copenhagen land use plan:** vector file reporting the area type designation as defined by the 2019 Copenhagen Municipal plan, which defines 9 area types (i.e., housing, housing and service industry, service industry, mixed industry, industry, port purpose, technical facilities including roads, institutions and leisure areas, houseboats), each characterized by specific use, development options and maximum permissible pollution from companies and facilities. Accessible from: https://kbhkort.kk.dk/modules/mobile/?profile=planportal_kp19
-   **Document reporting approved development scenarios for motorway coverage:** Document provided by the end user.

[^11]: **This layer substitutes the weind speed (u and v components)** from ECWMF ERA5 for enhanced spatial detail.

## Commercial Data

**High Frequency Location-Based (HFLB) Data for Denmark, Spain and Italy.** High Frequency Location-Based (HFLB) data for the entirety of Denmark purchased from the commercial provider PickWell, covering two distinct time periods. The first dataset spans from July 2019 to March 2020, aligning with the concurrent collection of CAV street-level air quality data. This synchronization enables a more cohesive analysis of environmental and mobility factors. The second dataset extends from October 2022 to October 2023. This period deviates from the initially proposed January-December 2022 timeframe, as mentioned in our proposal submission. This adjustment was made to accommodate a preference for more current data, expressed by local stakeholders. This up-to-date dataset is expected to offer a more accurate reflection of present-day mobility patterns both in Copenhagen and across Denmark. Both datasets encompass an average of 200,000 daily active users, which represents approximately 3.5% of Denmark's total population. These data sets are instrumental in analysing and understanding human mobility patterns over time, providing valuable insights into the dynamics of population movement within the country.

In addition to the Danish data, the extended version of CityNexus incorporates **12 months of historical HFLB data** for **Italy and Spain**, covering the period from **September 2023 to August 2024**. These datasets provide critical insights into mobility trends in cities such as Bologna and Seville, supporting tailored analyses for their unique urban challenges. The inclusion of this additional data allows for a consistent and comparative framework across the expanded project scope, ensuring that localized solutions for Bologna, Seville, and Aarhus are informed by robust, region-specific mobility patterns.

The data, provided already fully anonymised and GDPR compliant, is currently stored with high security and safety measures on MindEarth's dedicated cloud infrastructure, specifically within an AWS S3 bucket.

## Data Summary

Table 1 - DEDP Datasets

| Type           | Product                                               | Variables                                                                                         | Resolution      | Delivery                          | Required Temporal Coverage                                                                   |
|----------------|-------------------------------------------------------|---------------------------------------------------------------------------------------------------|-----------------|-----------------------------------|----------------------------------------------------------------------------------------------|
| Meteorologica  | NASA MERRA-2                                          | Planetary Boundary Layer Height layer.                                                            | 70 km           | Hourly                            | Baseline: [01/07/2019 - 29/02/2020 and  01/10/2022 - 31/10/2023] Ideal: 01/07/2019 - present |
| Meteorological | ECMWF ERA5 Data                                       | Surface net solar radiation, planetary boundary layer height, total precipitation, 2m temperature | \~25 km (0.25°) | Hourly                            | Baseline: [01/07/2019 - 29/02/2020 and  01/10/2022 - 31/10/2023] Ideal: 01/07/2019 - present |
| Environmental  | Sentinel-5P TROPOMI Level-2                           | Tropospheric NO₂, SO₂, O₃ vertical column densities, cloud fraction for NO₂                       | 5.5 x 3.5 km    | Daily vertical column densities   | Baseline: [01/07/2019 - 29/02/2020 and  01/10/2022 - 31/10/2023] Ideal: 01/07/2019 - present |
| Topographic    | Copernicus DEM 30m                                    | Global elevation dataset with slope analysis and terrain details                                  | 30 meters       | Static                            | Latest available                                                                             |
| Land Cover     | COPERNICUS CORINE Land Cover                          | 44 land cover classes                                                                             | 100 meters      | Static, last update: 2018         | Latest available                                                                             |
| Meteorological | Daily Global Forecast Layer from DestinE Digital Twin | Temperature, precipitation, wind speed (u/v components), surface pressure, radiation              | 4.4 km          | Daily initialized 4-day forecasts | Latest available                                                                             |

Table 2 - Other EO and ancillary data

| Type           | Product                                                                 | Variables                                                         | Resolution         | Delivery                                                                                                                | Required Temporal Coverage                                                                |
|----------------|-------------------------------------------------------------------------|-------------------------------------------------------------------|--------------------|-------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| Hydrography    | Hydrography90m                                                          | Stream topographic and topological information                    | 90 meters          | Static                                                                                                                  | Latest available                                                                          |
| Wind Data      | Global Wind Atlas (GWA)                                                 | Wind speed at heights (10m, 50m, 100m)                            | 250 meters         | Static                                                                                                                  | Latest available                                                                          |
| Population     | Global Human Settlement Layer (GHSL)                                    | Population density                                                | Static             | Static, time-independent                                                                                                | Latest available                                                                          |
| Air Quality    | EEA AirBase – Poland and Germany                                        | PM2.5, PM10, NO2, O3                                              | Station-based      | Updated periodically                                                                                                    | Latest available                                                                          |
| Air Quality    | Near-ground air pollution levels (NAMP)                                 | NO2, SO2, NOx, CO, O3, PM10, PM2.5, benzene, heavy metals         | Station-based      | Updated every 2 years                                                                                                   | Latest available                                                                          |
| Transportation | Public transport schedule data (GTFS)                                   | Timetables, delays, routes, stations/stops                        | Varies by source   | Regular updates from multiple sources                                                                                   | 2016 - 2021                                                                               |
| Air Quality    | Copenhagen Air View (CAV) - Raw Survey Data                             | NO2, black carbon, ultrafine particles                            | Point-based        | Open license, end-user provided                                                                                         | Data provided during campaigns                                                            |
| Road Network   | Road Network (OSM + Missing Roads Dataset)                              | Building footprints, land use, road details (lanes, speed limits) | Varies by location | Updated via Open Mapping initiative                                                                                     | Latest available                                                                          |
| Land Use       | Copenhagen land use plan                                                | Area type designation for urban planning                          | Vector-based       | Static, updated in 2019                                                                                                 | 2019                                                                                      |
| Documentation  | Approved motorway coverage scenarios                                    | Development scenarios for motorway coverage                       | N/A                | Provided by end-user                                                                                                    | Latest available                                                                          |
| Mobility Data  | High Frequency Location-Based (HFLB) Data for Denmark, Spain, and Italy | Human mobility patterns, daily active user counts                 | N/A                | Two periods for Denmark (Jul 2019 - Mar 2020, Oct 2022 - Oct 2023); 12 months for Italy and Spain (Sep 2023 - Aug 2024) | Jul 2019 - Mar 2020; Oct 2022 - Oct 2023 (Denmark); Sep 2023 - Aug 2024 (Italy and Spain) |
