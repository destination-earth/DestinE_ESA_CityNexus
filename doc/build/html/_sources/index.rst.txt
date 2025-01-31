.. CITYNEXUS documentation master file, created by
   sphinx-quickstart on Fri May 17 14:14:51 2024.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to CITYNEXUS's documentation!
=====================================

.. toctree::
   :maxdepth: 2
   :caption: Contents:



CityNexus is an innovative **urban digital twin application** designed to assess the **environmental, social, and economic impacts of changes in road networks, mobility, and urban space design**. 

The platform is designed to provide policymakers a **collaborative platform to experiment with various strategies and solutions**, considering diverse factors and variables crucial for successful and sustainable urban interventions, thereby facilitating a coordinated approach to decision-making.

**The service is still under deployment, this is a testing version and no guarantee is given on the accuracy of the results provided.**

CityNexus Platform Overview
---------------------------

The CityNexus platform aims to facilitate evidence-based decision-making at the municipality level by providing capabilities to **evaluate a comprehensive set of Key Performance Indicators (KPIs)** and by implementing an **interactive system for assessing the impact of infrastructural and mobility changes on the target KPIs** through policy-relevant, user-defined 'what-if' scenario simulations.

The five thematic areas addressed are:

- **Mobility Patterns**: CityNexus provides detailed insights into commuting patterns, travel behavior, traffic flows, congestion rates, peak traffic hours, and overall mobility dynamics in the city. This information is crucial for understanding and addressing the challenges of urban transport and traffic management.
- **Air Quality**: The platform evaluates the concentration of various pollutants at ground level, like nitrogen dioxide (NO2), sulfur dioxide (SO2), carbon monoxide (CO), ozone (O3), black carbon particles, and ultrafine particles. 
- **Dynamic Population Distribution**: CityNexus describes human presence patterns over time, aiding in the understanding of population movements and densities in different city areas.
- **Public Environmental Health**: The platform assesses how air pollution affects public health, including the incidence of diseases associated with exposure to different pollutants.
- **Service Accessibility**: It evaluates the availability, accessibility, and equity of key urban services such as transportation, healthcare, education, workplaces, commercial, and recreational facilities. 

What-If Analysis with CityNexus
-------------------------------

CityNexus offers dedicated functionalities for performing "what if" simulations on 4 scenarios, where users are given the possibility to assess the effects of different types of interventions on the mobility patterns and all other targeted KPIs:

.. image:: images/citynexus_rendering_2.png
   :scale: 30
   :align: right
   :alt: alternate text

1.	**High-speed Road Redesign**: this scenario simulates potential transformation of high-speed road segments into tunnels to reclame the corresponding space for residential areas, green spaces, or recreational/leisure amenities. 
2.	**Electric, Low-Emission Vehicles, and Active Mobility Promotion**: this scenario enables users to customize the proportion of electric and low-emission vehicles within the overall traffic fleet, to promote the adoption of sustainable transportation initiatives and climate-neutrality ambitions.
3.	**Low Emission Zones Creation**: this scenario allows users to convert specific census units, neighborhoods or manually defined areas to LEZ (Low Emission Zones), where motorized circulation is prohibited or limited to specific classes of vehicles;
4.	**Road Speed Adjustment**: this scenario enables adjustments to speed limits for specific road segments or entire categories of roads, to simulate the impact of high traffic speed on air quality and environmental pollution.


User Manual
-----------

The CITYNEXUS service is deployed on OVH cloud and offered as a service on the DestinE through DESP Integration. 

A user who accessing CityNexus is redirected to the DESP login interface. After the login, user is redirected to the GUI. The user works with maps representing scenarios for the what-if analysis and simulation results to be analysed. Upon accessing CityNexus UI, the user is prompted to select the data they want to visualise within the application.

There are 2 types of maps that can be visualized:

1.	**“What-if” scenarios.** The scenarios are maps where the user can select road segments and grid zones to create simulation inputs, by modifying the parameters associated to segments or to grid zones.
2. **Predictions.** The predictions are maps visualizing model predictions.

Scenarios
---------

Available what-if scenarios are displayed in a grid layout with thumbnails showing what the map looks like (the screenshot uses placeholder images). The grid allows the user to load, delete or download existing scenarios.

In the top left corner of the grid, a dropdown menu can be used to select the city of interest to the user and filter the predictions and scenarios accordingly. A reload button can also be clicked to reload the predictions and scenarios, if needed; this can be useful to update the processing status of pending simulations as seen in Figure 9.
 
.. image:: images/image007.png
   :scale: 100
   :align: center
   :alt: Scenario Selection

When loading a scenario, the map is populated with the scenario’s grid and road data and provides the user with several features to interact with and visualize the data.

Maps consist of road segments and grid hexagons. Each segment or tile contains several parameters that describe the element. Parameter values can be changed and/or selected to define new simulation scenarios.
 
.. image:: images/image008.png
   :scale: 100
   :align: center
   :alt: Scenario visualization

Figure 2 describes the main UI components shown to the user when loading a scenario:

1.	The side panel, with the layers tab shown by default, is the main way to configure the visualization, filter and explore the data, load another prediction or scenario…
2.	The horizontal button toolbar allows the user to control their modifications to the loaded scenario, starting a simulation, saving or downloading their changes…
3.	The vertical button toolbar has several useful functionalities, such as splitting the visualisation into side-by-side visualisation, changing the 3D perspective, multiselecting roads or grid hexagons, showing the legend…
4.	By default, the colours are chosen as follows: purple for roads, green for the grid and orange for road or grid elements that have been modified by the user.
 
.. image:: images/image009.png
   :scale: 100
   :align: center
   :alt: Scenario Modification

Figure 3 focuses on the interaction possibilities with the map itself:

1.	Hovering over or clicking on a road or grid element opens a window summarising the parameters of the specific element, along with their units.
2.	The user has the possibility to edit the values of the parameter.
3.	Only five parameters are shown by default. Clicking the Show More button will show the remaining parameters.
 
.. image:: images/image010.png
   :scale: 100
   :align: center
   :alt: Grid Tile Multiselection and Modifiable Properties 

The multiselection feature shown in Figure 4 allows the user to select all road or grid elements in an area:

1.	The area is a user-defined rectangle or polygon.
2.	The elements covered by the selection are highlighted.
3.	Modifying the values of parameters will modify all the elements in the area.
4.	The selection always covers only the road segments or the grid hexagons and can be toggled between both.
 
.. image:: images/image011.png
   :scale: 100
   :align: center
   :alt: Road Segment Modifiable Properties, Multiselection and Road Type Selection

Road multiselection is particular in that the selection and modifications can be further refined to only target roads of a specific type (e.g. motorway or residential roads).

The following properties can be edited in road segments:

•	Closed (Boolean). This flag specifies whether the road is closed (T) or open (F)
•	Underground (Boolean). This flag specifies whether the road segment is tunnelled (T) or not (F)
•	Speed (Integer). This value defines the maximum speed allowed on the road segment.

The grid consists of 100x100m hexagons, each tile describing the Points of Interest in that area and the type of land usage (residential, commercial and others).

The following properties can be edited in zone tiles:

•	Landuse. Defines the ratio of the area covered by 4 types of land usage: Residential, Commercial, Agricultural and Industrial
•	Points of interest. Defines the number of points of interest in the area. Types of POIs are Food, Fun, Health, Infrastructure, School, Services, Shop, Sport, Tourism.

While editing their scenario, the user is given control of the changes they make with several functionalities available in a button toolbar. A different set of functionalities is offered depending on the user’s account status (logged-in or not).

Guest users have access to:

•	Undo and redo changes to the map
•	Download a summary of the changes made to the map

Logged-in users have access to the same functionalities as guests, they can also:

•	Configure and start simulations
•	Save their changes so they can be persisted and accessed later

.. image:: images/image012.png
   :scale: 100
   :align: center
   :alt: Toolbar for guest user

.. image:: images/image013.png
   :scale: 100
   :align: center
   :alt: Toolbar for logged-in user

Changes to grid tile and road segment parameters along with scenario simulation meta-parameters have effects on the simulated mobility and traffic patterns. A scenario simulation is run by specifying:

•	the percentage of bicycles in circulation over the total number of vehicles
•	the percentage of electric cars in circulation over the total number of vehicles
•	the type of the day (weekday and/or weekend) 
•	3h timeslot(s)
•	optionally, an XAI analysis
 
.. image:: images/image014.png
   :scale: 100
   :align: center
   :alt: Start new simulation

The output of a simulation includes:

•	Pollutants Concentration: 5 different pollutants (CO2, CO, HC, NOx, PMx)
•	Statistics: (Fuel Consumption, Speed, Congestion, Traffic Induced Noise)

Simulations are saved in the user workspace when available. Simulation in Figure 12 for instance shows forecast NO2 pollution values, calculated at a time slot around 03:00 on a weekend.

Predictions
-----------

The model predictions are displayed in a table which can be sorted and filtered to make it easier for the user to select the simulation they are interested in. The table also allows the user to delete or download existing simulations.
 
.. image:: images/image015.png
   :scale: 100
   :align: center
   :alt: Prediction selection

When you select a simulation, a window will pop up allowing the user to configure the visualization of the simulation: which parameters are of interest and of which dataset(s). Each selected parameter will be displayed in its own visualization layer. The user can also close the window or click on cancel to keep the default visualization configuration (only showing the no2 layer).
 
.. image:: images/image016.png
   :scale: 100
   :align: center
   :alt: Configure simulation visualization

Once the window is closed, the user has several options at their disposal to further configure, explore or modify the visualization, as displayed in Figure 11:

1.	Open: Load additional simulation visualizations (up to 3) or load a scenario visualization. Loading a scenario removes all loaded simulations.
2.	Configure: Show the Configure Visualization window, to select the visualized parameters and datasets.
3.	Configure the visualized layers/parameters: show and hide layers, configure the colour scale, etc.
4.	Activate the split functionality with the ”Dual map view” button in the vertical button bar. The user can select which layer is shown on which side. 
5.	Open the legend for the loaded layers.
6.	View parameter values for individual road segments or grid tiles by hovering over or clicking on them.
 
.. image:: images/image017.png
   :scale: 100
   :align: center
   :alt: Simulation Visualization

The side panel’s Filter tab shown in Figure 12 provides additional tools to help the user analyse the data created by the mobility model:

1.	Clicking on the Filter icon in the side panel opens the Filters tab. There the user can either create a custom filter or toggle pre-defined filters on and off.
2.	“Show only occupied roads” hides all roads with 0 occupancy.
3.	“Show time scale” opens the time window.
4.	The time window allows the user to scroll through the simulated time slots by increments of 3 hours. In the screenshot, the simulation was generated for all time slots.
 
.. image:: images/image018.png
   :scale: 100
   :align: center
   :alt: Simulation Output Example

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
