<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
	xmlns:dcterms="http://purl.org/dc/terms/"
	xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
	xmlns:bpmno="http://dkm.fbk.eu/index.php/BPMN2_Ontology#" 
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
	>
	
	<!-- I HAVE PUT A PLACEHOLDER FOR THE BASE URI HERE, BUT IT IS UP TO YOU TO THINK OF A STRATEGRY. -->
	<xsl:variable name="baseuri" select="'http://www.example.org/resource/'" />

	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates />
		</rdf:RDF>
	</xsl:template>

	<xsl:template match="//bpmn:task">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#task" />
			<xsl:call-template name="relateddata"/>
			<xsl:call-template name="flowelement"/>
			
		</rdf:Description>
	</xsl:template>

	<xsl:template match="//bpmn:startEvent">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#startEvent" />
			<xsl:call-template name="nodename"/>
		</rdf:Description>
	</xsl:template>

	<xsl:template match="//bpmn:boundaryEvent">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#boundaryEvent" />
			<xsl:call-template name="flowelement"/>
		</rdf:Description>
	</xsl:template>

	<xsl:template match="//bpmn:subProcess">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#subProcess" />
			<xsl:call-template name="flowelement"/>
		</rdf:Description>
	</xsl:template>
	<xsl:template match="//bpmn:eventBasedGateway">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#eventBasedGateway" />
			<xsl:call-template name="flowelement"/>
		</rdf:Description>
	</xsl:template>

	<xsl:template match="//bpmn:complexGateway">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#complexGateway" />
			<xsl:call-template name="flowelement"/>
		</rdf:Description>
	</xsl:template>

	<xsl:template match="//bpmn:inclusiveGateway">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#inclusiveGateway" />
			<xsl:call-template name="flowelement"/>
		</rdf:Description>
	</xsl:template>
	
	<xsl:template match="//bpmn:exclusiveGateway">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#exclusiveGateway" />
            <xsl:call-template name="flowelement"/>
		</rdf:Description>
	</xsl:template>
	
	<xsl:template match="//bpmn:parallelGateway">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#parallelGateway" />
			<xsl:call-template name="flowelement"/>
		</rdf:Description>
	</xsl:template>
	
	<xsl:template match="//bpmn:intermediateThrowEvent">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#intermediateThrowEvent" />
			<xsl:call-template name="flowelement"/>
		</rdf:Description>
	</xsl:template>

	<xsl:template match="//bpmn:intermediateCatchEvent">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#intermediateThrowEvent" />
			<xsl:call-template name="flowelement"/>
		</rdf:Description>
	</xsl:template>	
	
	<xsl:template match="//bpmn:endEvent">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#endEvent" />
			<xsl:call-template name="flowelement"/>
		</rdf:Description>
	</xsl:template>


	<xsl:template match="//bpmn:callActivity">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#callActivity" />
			<xsl:call-template name="flowelement"/>
		</rdf:Description>
	</xsl:template>	

	<xsl:template match="//bpmn:serviceTask">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#serviceTask" />
			<xsl:call-template name="flowelement"/>
		</rdf:Description>
	</xsl:template>	

	<xsl:template match="//bpmn:businessRuleTask">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#businessRuleTask" />
			<xsl:call-template name="flowelement"/>
		</rdf:Description>
	</xsl:template>	
	
	<xsl:template match="//bpmn:sequenceFlow">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#sequenceFlow" />
			<bpmno:has_sourceRef rdf:resource="{$baseuri}{@sourceRef}" />
			<bpmno:has_targetRef rdf:resource="{$baseuri}{@targetRef}" />
			<xsl:call-template name="flowelement"/>
		</rdf:Description>
	</xsl:template>

	<xsl:template match="//bpmn:manualTask">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#manualTask" />
            <xsl:call-template name="flowelement"/>
		</rdf:Description>
	</xsl:template>

	<xsl:template match="//bpmn:userTask">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#userTask" />
            <xsl:call-template name="flowelement"/>
		</rdf:Description>
	</xsl:template>
	<xsl:template match="//bpmn:receiveTask">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#receiveTask" />
            <xsl:call-template name="flowelement"/>
		</rdf:Description>
	</xsl:template>
	<xsl:template match="//bpmn:sendTask">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<xsl:call-template name="flowelement"/>
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#sendTask" />
		</rdf:Description>
        <xsl:call-template name="relateddata"/>
	</xsl:template>
	
	<xsl:template match="//bpmn:scriptTask">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<xsl:call-template name="flowelement"/>
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#scriptTask" />
		</rdf:Description>
        <xsl:call-template name="relateddata"/>
	</xsl:template>

    <xsl:template match="//bpmn:transaction">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<xsl:call-template name="flowelement"/>
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#transaction" />
		</rdf:Description>
        <xsl:call-template name="relateddata"/>
	</xsl:template>

	<xsl:template match="//bpmn:dataObjectReference">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#dataObjectReference" />
			<bpmno:has_dataObjectRef rdf:resource="{$baseuri}{@dataObjectRef}" />
			<xsl:call-template name="nodename"/>
		</rdf:Description>
	</xsl:template>
	<xsl:template match="//bpmn:dataObject">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#dataObject" />
			<xsl:call-template name="nodename"/>
		</rdf:Description>
	</xsl:template>
    <xsl:template match="//bpmn:dataStoreReference">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#dataObject" />
            <xsl:call-template name="nodename"/>
		</rdf:Description>
	</xsl:template>

    <xsl:template match="//bpmn:association">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#association" />
            <bpmno:has_sourceRef rdf:resource="{$baseuri}{@sourceRef}" />
	        <bpmno:has_targetRef rdf:resource="{$baseuri}{@targetRef}" />
		</rdf:Description>
	</xsl:template>


	<xsl:template match="//bpmn:textAnnotation">
		<rdf:Description rdf:about="{$baseuri}{@id}">
			<rdf:type rdf:resource="http://dkm.fbk.eu/index.php/BPMN2_Ontology#textAnnotation" />
             <xsl:if test="//bpmn:text != ''">
			<bpmno:ForPurpose><xsl:value-of select="//bpmn:text" /></bpmno:ForPurpose>
	  </xsl:if>   
		</rdf:Description>
	</xsl:template>

	<xsl:template name="makeli">
      <bpmno:has_dataStoreRef rdf:resource="{$baseuri}{//bpmn:sourceRef}" />
	<bpmno:has_dataStoreRef rdf:resource="{$baseuri}{//bpmn:targetRef}" />
    </xsl:template>
    
    <xsl:template name="relateddata">
        <xsl:for-each select="bpmn:property"> 
            <rdf:Description rdf:about="{$baseuri}{@id}">
                <xsl:call-template name="nodename"/>
			</rdf:Description>
		</xsl:for-each> 
		<xsl:for-each select="bpmn:dataInputAssociation"> 
            <rdf:Description rdf:about="{$baseuri}{@id}">
                <bpmno:has_itemAwareElement rdf:resource="{$baseuri}{//bpmn:sourceRef}" />
                <bpmno:has_itemAwareElement rdf:resource="{$baseuri}{//bpmn:targetRef}" />
			</rdf:Description>
		</xsl:for-each> 
    </xsl:template>

    <xsl:template name="nodename">
      <xsl:if test="@name != ''">
			<bpmno:name><xsl:value-of select="@name" /></bpmno:name>
	  </xsl:if>
    </xsl:template>
    <xsl:template name="flowelement">
 
      <xsl:if test="@cancelActivity != ''">
            <bpmno:cancelActivity><xsl:value-of select="@cancelActivity" /></bpmno:cancelActivity>
        </xsl:if>
        <xsl:if test="@attachedToRef != ''">
            <bpmno:has_attachedToRef rdf:resource="{$baseuri}{@attachedToRef}" />
        </xsl:if> 
        <xsl:if test="@name != ''">
            <bpmno:name><xsl:value-of select="@name" /></bpmno:name>
        </xsl:if>
        <xsl:for-each select="bpmn:escalationEventDefinition"> 
                <bpmno:has_eventDefinition rdf:resource="bpmno:escalationEventDefinition" />
		</xsl:for-each> 
         <xsl:for-each select="bpmn:messageEventDefinition"> 
                <bpmno:has_eventDefinition rdf:resource="bpmno:messageEventDefinition" />
		</xsl:for-each> 
        <xsl:for-each select="bpmn:compensateEventDefinition"> 
                <bpmno:has_eventDefinition rdf:resource="bpmno:compensateEventDefinition" />
		</xsl:for-each> 
         <xsl:for-each select="bpmn:cancelEventDefinition"> 
                <bpmno:has_eventDefinition rdf:resource="bpmno:cancelEventDefinition" />
		</xsl:for-each> 
        <xsl:for-each select="bpmn:errorEventDefinition"> 
                <bpmno:has_eventDefinition rdf:resource="bpmno:errorEventDefinition" />
		</xsl:for-each> 
         <xsl:for-each select="bpmn:timerEventDefinition"> 
                <bpmno:has_eventDefinition rdf:resource="bpmno:timerEventDefinition" />
		</xsl:for-each> 
        <xsl:for-each select="bpmn:linkEventDefinition"> 
                <bpmno:has_eventDefinition rdf:resource="bpmno:linkEventDefinition" />
		</xsl:for-each> 
        <xsl:for-each select="bpmn:conditionalEventDefinition"> 
                <bpmno:has_eventDefinition rdf:resource="bpmno:conditionalEventDefinition" />
                <xsl:for-each select="bpmn:condition"> 
                    <bpmno:has_condition rdf:resource="{@xsi:type}" />
                </xsl:for-each> 
		</xsl:for-each> 
         <xsl:for-each select="bpmn:signalEventDefinition"> 
                <bpmno:has_eventDefinition rdf:resource="bpmno:signalEventDefinition" />
		</xsl:for-each> 
        <xsl:if test="//bpmn:incoming != ''">
            <bpmno:has_sequenceFlow rdf:resource="{$baseuri}{//bpmn:incoming}" />
        </xsl:if>
        <xsl:if test="//bpmn:outgoing != ''">
            <bpmno:has_sequenceFlow rdf:resource="{$baseuri}{//bpmn:outgoing}" />
        </xsl:if>
        <xsl:for-each select="bpmn:dataInputAssociation"> 
            <bpmno:has_dataInputAssociation rdf:resource="{$baseuri}{@id}"/> 
        </xsl:for-each> 
    </xsl:template>

	<xsl:template match="text()" />

</xsl:stylesheet>