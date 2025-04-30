.. CITYNEXUS documentation master file, created by
   sphinx-quickstart on Fri May 17 14:14:51 2024.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

#####################################
Welcome to CITYNEXUS's documentation!
#####################################

.. toctree::
   :maxdepth: 2
   :caption: Contents:

CityNexus is an innovative **urban digital twin application** designed to assess the **environmental, social, and economic impacts of changes in road networks, mobility, and urban space design**. 

Leveraging the DESP/DestinE system, CITYNEXUS aims to evaluate baseline conditions for human mobility, including key indicators like air quality, population distribution, public health, and service accessibility and integrates live what-if scenario capabilities.

The platform is designed to provide policymakers a **collaborative platform to experiment with various strategies and solutions**, considering diverse factors and variables crucial for successful and sustainable urban interventions, thereby facilitating a coordinated approach to decision-making.


CityNexus Platform Overview
===========================

.. image:: images/citynexus_rendering_3.png
   :scale: 100
   :align: right
   :alt: alternate text

The CityNexus platform aims to facilitate evidence-based decision-making at the municipality level by providing capabilities to **evaluate a comprehensive set of Key Performance Indicators (KPIs)** and by implementing an **interactive system for assessing the impact of infrastructural and mobility changes on the target KPIs** through policy-relevant, user-defined 'what-if' scenario simulations.

Currently, strategic decisions related to mobility and infrastructural interventions are primarily driven by economic constraints, thus overlooking the complex and multifaceted impacts on neighbourhoods and local communities. 
This issue is further exacerbated by a limited coordination and communication between districts of the same city or neighbouring municipalities, hence making it challenging to assess the holistic impact of a specific intervention on nearby areas.

To address these limitations, CITYNEXUS offers policymakers a collaborative environment where they can freely experiment with different strategies and solutions. 
It provides a comprehensive decision-making framework that goes beyond simplistic cost considerations and considers the specific needs expressed by the user community (reflected in the selected KPIs). 
In this regard, CITYNEXUS targets a set of KPIs (preliminary identified together with the end users) addressing different thematic areas, namely:

- **Mobility Patterns**: CityNexus provides detailed insights into commuting patterns, travel behavior, traffic flows, congestion rates, peak traffic hours, and overall mobility dynamics in the city. This information is crucial for understanding and addressing the challenges of urban transport and traffic management.
- **Air Quality**: The platform evaluates the concentration of various pollutants at ground level, like nitrogen dioxide (NO2), sulfur dioxide (SO2), carbon monoxide (CO), ozone (O3), black carbon particles, and ultrafine particles. 
- **Dynamic Population Distribution**: CityNexus describes human presence patterns over time, aiding in the understanding of population movements and densities in different city areas.
- **Public Environmental Health**: The platform assesses how air pollution affects public health, including the incidence of diseases associated with exposure to different pollutants.
- **Service Accessibility**: It evaluates the availability, accessibility, and equity of key urban services such as transportation, healthcare, education, workplaces, commercial, and recreational facilities. 

To support evidence-based decision making at the municipality level, CITYNEXUS operates at the **local scale**. 
To characterize the seasonal patterns of human mobility and, in turn, their relationships to the targeted KPIs, CITYNEXUS is intended to operate on a **quarterly temporal scale** and to differentiate the analyses between typical weekdays and weekends. 
On the one hand, this allows deriving statistically robust baseline conditions when characterizing the reference patterns for the human mobility and the different KPIs. 
On the other hand, this enables a more realistic and nuanced understanding of the effects of "what-if" mobility and infrastructural changes at different times of the year. 

Four cities acre currently available for demonstration purposes in the platform: **Copenaghen** (Denmark), **Bologna** (Italy), **Seville** (Spain), and **Aarhus** (Denmark). 
These cities were selected as first targets for their alignment with the project's focus on sustainable mobility, air quality improvement, and urban innovation. 
In priciple all cities participating in the EU Mission for 100 Climate-Neutral and Smart Cities by 2030 underscore a shared commitment to climate adaptation and sustainable urban development, hence they are candidates for future adaptations and extensions of the platform.  

The CITYNEXUS models have been trained using:

- High Frequency Location Based (HFLB) mobility data
- Sentinel-5P TROPOMI Level2 daily tropospheric NO2, SO2, CO, O3 vertical column densities 
- Copernicus Digital Elevation Model of Europe at 10m resolution
- ECMWF ERA5 hourly estimates for different meteorological variables
- CORINE Land Cover from the Copernicus Land Monitoring Service at 100m 

What-If Analysis with CityNexus
===============================

CityNexus offers the capability of implementing "what if" analysis, where users are given the possibility to assess the effects of different types of interventions on the mobility patterns and all other targeted KPIs. Examples include:

.. image:: images/citynexus_rendering_2.png
   :scale: 40
   :align: right
   :alt: alternate text

1.	**High-speed Road Redesign**: this scenario regards the potential transformation of high-speed road segments into tunnels and reclaiming the corresponding space for residential areas, green spaces, or recreational/leisure amenities. It reflects ongoing discussions in the City of Copenhagen but has also a general validity.
2.	**Electric, Low-Emission Vehicles, and Active Mobility Promotion**: this scenario responds to the efforts to promote the adoption of electric and low-emission vehicles as well as of active mobility options as part of its sustainable transportation initiatives and climate-neutrality ambitions. This scenario responds an effort of the City of Copenhagen, but has also a general validity. To this purpose, CITYNEXUS enables users to customize the proportion of these vehicles and modes within the overall traffic fleet.
3.	**Low Emission Zones Creation**: this scenario allows users to convert specific census units, neighborhoods or manually defined areas to LEZ (Low Emission Zones), where motorized circulation is prohibited or limited to specific classes of vehicles.
4.	**Road Speed Adjustment**: this scenario reflects the impact of high traffic speed on air quality and environmental pollution. Accordingly, CITYNEXUS enables adjustments to speed limits for specific road segments or entire categories of roads. 
5. **Greener Streets**: this scenario supports the effort of the city of Bologna in targeting a 40% reduction in traffic-related greenhouse gas emissions by 2030. CITYNEXUS enables the simulation of the effects of increased % of bicycles in the traffic fleet, conversion of streets into pedestrian zones and street speed reduction, to enforces a 30 km/h speed limit in residential areas to enhance safety and reduce emissions.
6. **Eco-mobility Campaign**: this scenario combines the Low Emission Zone Creation scenario with the Active Mobility Promotion scenario to support the efforts of the city of Seville in increasing cycling’s modal share to nearly 6% of total urban mobility while contextually restricting high-emission vehicles in key areas to reduce pollution and enhance public health.

The scenarios are defined for the what-if analysis by specifying:

- Road segment properties (to close or underground a street, or to limit the max speed allowed)
- Grid properties (to define the landuse and type of Points of Interest in an area)
- The percentage of bicycles and electric vehicle in circulation over the total number of vehicles
- The type of the day (weekday and/or weekend) 
- A set of 3h timeslot(s)

For the selected parameters and timeslots CITYNEXUS provides estimations of:

- Pollutants Concentration: 5 different pollutants (CO2, CO, HC, NOx, PMx)
- Mobility Statistics: FuelAverage Fuel Consumption, Average Speed, Congestion, Traffic Induced Noise


Workspace Management
====================

After the login, the user is redirected to the WorkSpace management GUI.

The user works with maps of the 4 demosntration cities.

These maps represents:

- The city baseline map (only these maps are available the first time a user logs in)
- Previosuly defined scenarios for the what-if analysis 
- Scenario's Simulation results (for the analysis).

Upon accessing the UI, the user is prompted to select the data they want to visualise within the application.

Available what-if scenarios are displayed in a grid layout with thumbnails showing what the map looks like (the screenshot uses placeholder images). The grid allows the user to load, delete or download existing scenarios.

In the top left corner of the grid, a dropdown menu can be used to select the city of interest to the user and filter the predictions and scenarios accordingly. A reload button can also be clicked to reload the predictions and scenarios, if needed; this can be useful to update the processing status of pending simulations.

.. figure:: images/image007.png
   :scale: 50
   :align: center
   :alt: Scenario Selection
   
   Scenario Selection

The model predictions are displayed in a table shown by clicking on the "Show Results" button on a scenario. 

Simulations can be sorted and filtered to make it easier for the user to select the simulation they are interested in. 

The table also allows the user to delete or download existing simulations.

.. figure:: images/image015.png
   :scale: 50
   :align: center
   :alt: Prediction selection
   
   Prediction selection


When you select a simulation, a window will pop up allowing the user to configure the visualization of the simulation: which parameters are of interest and of which dataset(s). 

Each selected parameter will be displayed in its own visualization layer. 

The user can also close the window or click on cancel to keep the default visualization configuration (only showing the no2 layer).

.. figure:: images/image016.png
   :scale: 70
   :align: center
   :alt: Configure simulation visualization
   
   Simulation Visulaziation Configuration 

Scenario Definition & Simulation
================================

When loading a scenario, the map is populated with the scenario’s grid and road data and provides the user with several features to interact with and visualize the data.

Maps consist of road segments and grid hexagons. Each segment or tile contains several parameters that describe the element. Parameter values can be changed and/or selected to define new simulation scenarios.
 
Figure below describes the main UI components shown to the user when loading a scenario:

1.	The side panel, with the layers tab shown by default, is the main way to configure the visualization, filter and explore the data, load another prediction or scenario…
2.	The horizontal button toolbar allows the user to control their modifications to the loaded scenario, starting a simulation, saving or downloading their changes…
3.	The vertical button toolbar has several useful functionalities, such as splitting the visualisation into side-by-side visualisation, changing the 3D perspective, multiselecting roads or grid hexagons, showing the legend…
4.	By default, the colours are chosen as follows: purple for roads, green for the grid and orange for road or grid elements that have been modified by the user.

.. figure:: images/image008.png
   :scale: 50
   :align: center
   :alt: Scenario visualization
   
   Scenario Visualization

The figure below shows the interaction possibilities with the map itself to define a scenario:

1.	Hovering over or clicking on a road or grid element opens a window summarising the parameters of the specific element, along with their units.
2.	The user has the possibility to edit the values of the parameter.
3.	Only five parameters are shown by default. Clicking the Show More button will show the remaining parameters.

.. figure:: images/image009.png
   :scale: 50
   :align: center
   :alt: Scenario Modification

   Scenario Definition


The multiselection feature shown below allows the user to select all road or grid elements in an area:

1.	The area is a user-defined rectangle or polygon.
2.	The elements covered by the selection are highlighted.
3.	Modifying the values of parameters will modify all the elements in the area.
4.	The selection always covers only the road segments or the grid hexagons and can be toggled between both.

.. figure:: images/image010.png
   :scale: 50
   :align: center
   :alt: Grid Tile Multiselection and Modifiable Properties 

   Grid Tile Multiselection and Properties

Road multiselection is particular in that the selection and modifications can be further refined to only target roads of a specific type (e.g. motorway or residential roads).

The following properties can be edited in road segments:

- Closed (Boolean). This flag specifies whether the road is closed (T) or open (F)
- Underground (Boolean). This flag specifies whether the road segment is tunnelled (T) or not (F)
- Speed (Integer). This value defines the maximum speed allowed on the road segment.

.. figure:: images/image011.png
   :scale: 50
   :align: center
   :alt: Road Segment Modifiable Properties, Multiselection and Road Type Selection

   Road Segment Modifiable Properties, Multiselection and Road Type Selection


The grid consists of 100x100m hexagons, each tile describing the Points of Interest in that area and the type of land usage (residential, commercial and others).

The following properties can be edited in zone tiles:

- Landuse. Defines the ratio of the area covered by 4 types of land usage: Residential, Commercial, Agricultural and Industrial
- Points of interest. Defines the number of points of interest in the area. Types of POIs are Food, Fun, Health, Infrastructure, School, Services, Shop, Sport, Tourism.

While editing their scenario, the user is given control of the changes they make with several functionalities available in a button toolbar. A different set of functionalities is offered depending on the user’s account status (logged-in or not).

Guest users have access to:

- Undo and redo changes to the map
- Download a summary of the changes made to the map

Logged-in users have access to the same functionalities as guests, they can also:

- Configure and start simulations
- Save their changes so they can be persisted and accessed later

.. figure:: images/image012.png
   :scale: 50
   :align: center
   :alt: Toolbar for guest user
   
   Toolbar (guest user)

.. figure:: images/image013.png
   :scale: 50
   :align: center
   :alt: Toolbar for logged-in user

   Toolbar (registered user)

Changes to grid tile and road segment parameters along with scenario simulation meta-parameters have effects on the simulated mobility and traffic patterns. A scenario simulation is run by specifying:

- the percentage of bicycles in circulation over the total number of vehicles
- the percentage of electric cars in circulation over the total number of vehicles
- the type of the day (weekday and/or weekend) 
- 3h timeslot(s)
 
.. figure:: images/image014.png
   :scale: 80
   :align: center
   :alt: Start new simulation

   New Simulation


The output of a simulation provides pollutants concentration and traffic statistics. 

The following pollutants are simulated (total production per road segment in a time slot of 3h):

- NO₂, Nitrogen dioxide (provided in Grams and in Micrograms per cubic meter, a mass concentration unit, often used by environmental protection agencies to set regulatory limits). NO₂ is a major air pollutant with significant implications for human health and the environment. It contributes to the formation of tropospheric ozone (smog), it is a precursor to acid rain and it plays a role in the formation of fine particulate matter (PM2.5) 
- CO₂, Carbon dioxide, a key greenhouse gas and a critical component of the carbon cycle (provided in Grams). CO₂ traps heat in Earth’s atmosphere, contributing to global warming. Dissolved in water contributes to ocean acidification, lowering ocean pH and affecting marine life. It is a major driver for climate regulation. 
- NOₓ, Nitrogen Oxides (provided in Grams). NOₓ gases are formed mostly during high-temperature combustion processes, like those in engines, power plants, and industrial boilers.  NOₓ have major environmental and health impact, contribute to ground-level ozone (smog) formation, they are precursor to fine particulate matter (PM2.5) and affect ecosystems and vegetation by nutrient overload (eutrophication).
- PMₓ, Particulate Matter (provide in Grams), a crucial component in air pollution studies. PMₓ are linked to respiratory diseases, cardiovascular issues, and premature death. Major surces of PMₓ are: vehicle emissions, industrial activities, power plants (especially coal-fired) and constructions/demolitions.
- HC, Hydrocarbons (provided in Grams), organic compounds made up of hydrogen (H) and carbon (C) atoms. They are typically found in fuels, oils, and many industrial chemicals. In the context of air quality and emissions, HC generally refers to unburned or partially burned fuel components released into the air. Health and Environmental Impact of HC includes: some HC (like benzene) are carcinogenic, may exacerbate asthma and other respiratory conditions, react with NOₓ in sunlight to form ozone (O₃), contribute to smog formation. 
- CO, Carbon monoxide, a gas toxic to humans and animals. CO reduces oxygen delivery to organs and tissues, reacts in the atmosphere to form ozone (O₃) in the presence of NOₓ and sunlight and has an indirect impact on climate by affecting the atmospheric lifetime of methane and other greenhouse gases.

The foloowing traffic related statistics are simulated, for vehicles occupying a road segment in a time slot (3h):

- Fuel Consumption, in Grams 
- Traffic Speed, average, in km/h
- Occupation, in number of vehicles passign throug or stationing

Simulations are saved in the user workspace when available. Simulation in Figure 12 for instance shows forecast NO2 pollution values, calculated at a time slot around 03:00 on a weekend.

In this demonstration version, only 1 simulation per user per city is allowed in parallel. Simulations on different cities can be run in parallel, up to a maximum of 8 parallel simulations. A message informs when this limit is exceeded, in this case the simulation has to be started later when the system is less overloaded. 

Analysis & Visualization
========================

Once that a simulation is loaded, the user has several options at their disposal to further configure, explore or modify the visualization:

1.	Open: Load additional simulation visualizations (up to 3) or load a scenario visualization. Loading a scenario removes all loaded simulations.
2.	Configure: Show the Configure Visualization window, to select the visualized parameters and datasets.
3.	Configure the visualized layers/parameters: show and hide layers, configure the colour scale, etc.
4.	Activate the split functionality with the ”Dual map view” button in the vertical button bar. The user can select which layer is shown on which side. 
5.	Open the legend for the loaded layers.
6.	View parameter values for individual road segments or grid tiles by hovering over or clicking on them.
 
.. figure:: images/image017.png
   :scale: 50
   :align: center
   :alt: Simulation Visualization

   Comparative Analysis

The side panel’s Filter tab shown below above provides additional tools to help the user analyse the data created by the mobility model:

1.	Clicking on the Filter icon in the side panel opens the Filters tab. There the user can either create a custom filter or toggle pre-defined filters on and off.
2.	“Show only occupied roads” hides all roads with 0 occupancy.
3.	“Show time scale” opens the time window.
4.	The time window allows the user to scroll through the simulated time slots by increments of 3 hours. In the screenshot, the simulation was generated for all time slots. This feature also allows animated data visualziation.
 
.. figure:: images/image018.png
   :scale: 50
   :align: center
   :alt: Simulation Output Example

   Simulation Output Example

.. figure:: images/sim1.gif
   :scale: 50
   :align: center
   :alt: 24h Road Occupancy Simulation

   24h Road Occupancy Simulation

.. figure:: images/sim2.gif
   :scale: 50
   :align: center
   :alt: 24h No2 Concentration Simulation

   24h No2 Concentration Simulation

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
