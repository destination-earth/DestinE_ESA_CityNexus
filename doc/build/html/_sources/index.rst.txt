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

CITYNEXUS is deployed on cloud and offered as a service on the DestinE platform either via an API or trough a User Interface.

After the login, the simulation can be run directly by providing a JSON document as input and invoking the model  via web  API (see the API definition). 

When using the UI, the user works with maps representing scenarios for the what-if analysis and simulation results to be analysed. 

Upon accessing CityNexus UI, the user is prompted to select the data they want to visualise within the application.

There are 2 types of maps that can be visualized:

1.	**“What-if” scenarios.** The scenarios are maps where the user can select road segments and grid zones to create simulation inputs, by modifying the parameters associated to segments or to grid zones.
2. **Predictions.** The predictions are maps visualizing model predictions.

Available what-if scenarios are displayed in a grid layout with thumbnails showing what the map looks like (the screenshot below uses placeholder images).

.. image:: images/fig_1.png
   :scale: 100
   :align: center
   :alt: alternate text

The model predictions are displayed in a table which can be sorted and filtered to make it easier for the user to select the simulation they are interested in. 

.. image:: images/fig_2.png
   :scale: 100
   :align: center
   :alt: alternate text


Maps consist of road segments and/or grid squares. Each segment or square contains several parameters that describe the element. Parameter values can be changed and/or selected to define new simulation scenarios.


.. image:: images/fig_3.png
   :scale: 100
   :align: center
   :alt: alternate text


Streets are selectable by segments, and each segment is labelled with information about street type, traffic allowed, maximum speed and others. The information can be modified, by modifying the parameter in the UI that appears when selecting either a single road segment or when selecting multiple road segments with an area selection. 

The following properties can be edited in road segments:

- Closed (Boolean). This flag specifies whether the road is closed (T) or open (F)
- Tunnel (Boolean). This flag specifies whether the road segment is tunnelled (T) or not (F)
- Underground (Boolean). This flag specifies whether the road segment is underground (T) or not (F)
- Speed (Integer). This value defines the maximum speed allowed on the road segment.

.. image:: images/fig_3a.png
   :scale: 100
   :align: center
   :alt: alternate text

The grid consists of 100x100m exagons, each square describing the Points of Interest in that area and the type of land usage (residential, commercial and others).

The following properties can be edited in zone segments:

- Landuse. Defines the ratio of the area covered by 4 types of land usage: Residential, Commercial, Agricultural and Industrial
- Points of interest. Defines the number of points of interest in the area. Types of POIs are Food, Fun, Health, Infrastructure, School, Services, Shop, Sport, Tourism

.. image:: images/fig_3b.png
   :scale: 100
   :align: center
   :alt: alternate text

These factors have effects on the simulated mobility and traffic patterns. A scenario simulation is run by specifying:

- the percentage of bicycles in circulation over the total number of vehicles
- the percentage of electric cars in circulation over the total number of vehicles
- the type of the day (weekday or weekend) 
- A 3h timeslot

The output of a simulation includes:

- Pollutants Concentration: 5 different pollutants (CO2, CO, HC, NOx, PMx)
- Statistics: (Fuel Consumption, Speed, Congestion, Traffic Induced Noise)

Simulations are saved in the user workspace when available. Simulation below for instance shows a forecasted road occupancy percentage, calculated on a time slot around 12:00.

.. image:: images/fig_4.png
   :scale: 100
   :align: center
   :alt: alternate text




Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
